class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
  after_save    :maybe_broadcast, on: [:create, :update]
  after_destroy :maybe_broadcast

  DONT_BROADCAST = [ "created_at",
                     "last_sign_in_at",
                     "last_sign_in_ip",
                     "sign_in_count",
                    #  HACK: Regimens and RegimenItems won't sync if you
                    #  activate this line:
                    #  "updated_at",
                     "current_sign_in_at" ]

  # Sometimes the Ruby class name does not match up with the FBOS/FBJS/FE name.
  # Entering a class into this dictionary allows for special cases.
  SPECIAL_NAMES = {
    GenericPointer  => "Point"
  }

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
    {
      args: {
        label: (Device.current_jwt || {})[:jti] || "UNKNOWN"
      },
      body: (destroyed? ? nil : self).as_json
    }.to_json
  end

  def klass_name_as_string
    (SPECIAL_NAMES[self.class] || self.class.name)
  end

  def chan_name
    "sync.#{klass_name_as_string}.#{self.id}"
  end

  def broadcast!
    AutoSyncJob.perform_later(broadcast_payload,
                              Device.current.id,
                              chan_name,
                              Time.now.utc.to_i)
  end
end
