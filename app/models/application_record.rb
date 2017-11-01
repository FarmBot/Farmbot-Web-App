class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
  after_save    :maybe_broadcast, on: [:create, :update]
  after_destroy :maybe_broadcast

  DONT_BROADCAST = [ "created_at",
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
    {
      args: {
        label: (Device.current_jwt || {})[:jti] || "UNKNOWN"
      },
      body: (destroyed? ? nil : self).as_json
    }.to_json
  end

  def chan_name
    "sync.#{self.class.name}.#{self.id}"
  end

  def broadcast!
    Thread.new { `espeak "e"` }
    Transport.send(broadcast_payload, Device.current.id, chan_name)
  end
end
