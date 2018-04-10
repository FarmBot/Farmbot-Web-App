class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
  after_save    :maybe_broadcast, on: [:create, :update]
  after_destroy :maybe_broadcast

  DONT_BROADCAST = [ "created_at",
                     "last_saw_api",
                     "last_saw_mq",
                     "last_seen",
                     "last_sign_in_at",
                     "last_sign_in_ip",
                     "sign_in_count",
                     "updated_at",
                     "current_sign_in_ip",
                     "current_sign_in_at",
                     "fbos_version" ]
  def gone?
    destroyed? || self.try(:discarded?)
  end

  def the_changes
    self.saved_changes.except(*self.class::DONT_BROADCAST)
  end

  # Determine if the changes to the model are worth broadcasting or not.
  # Reduces network noise.
  def notable_changes?
    !the_changes.empty?
  end

  def broadcast?
    Device.current && (gone? || notable_changes?)
  end

  def maybe_broadcast
    self.broadcast! if broadcast?
  end

  def body_as_json # REMEMBER: Subclasses might override this! - RC
    if(gone?)
      return nil
    else
      serializer = ActiveModel::Serializer.serializer_for(self)
      return (serializer ? serializer.new(self) : self).as_json
    end
  end

  def broadcast_payload
    { args: { label: Transport.current_request_id }, body: body_as_json }.to_json
  end

  # Overridable
  def name_used_when_syncing
    self.class.name
  end

  def chan_name
    "sync.#{name_used_when_syncing}.#{self.id}"
  end

  def broadcast!
    AutoSyncJob.perform_later(broadcast_payload,
                              Device.current.id,
                              chan_name,
                              Time.now.utc.to_i)
  end
end
