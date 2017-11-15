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
                     "current_sign_in_at" ]

  # Determine if the changes to the model are worth broadcasting or not.
  # Reduces network noise.
  def notable_changes?
    !self.saved_changes.except(*self.class::DONT_BROADCAST).empty?
  end

  def broadcast?
    Device.current && (destroyed? || notable_changes?)
  end

  def maybe_broadcast
    self.broadcast! if broadcast?
  end

  def broadcast_payload
    body = (destroyed? ?
      nil : ActiveModel::Serializer.serializer_for(self).new(self))
    {
      args: { label: Transport.current_request_id },
      body: body.as_json
    }.to_json
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
