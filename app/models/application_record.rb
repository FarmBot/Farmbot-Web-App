class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
  after_save :maybe_broadcast, on: [:create, :update, :destroy]

  DONT_BROADCAST = [ "current_sign_in_at",
                     "last_sign_in_at",
                     "sign_in_count",
                     "updated_at",
                     "created_at" ]

  def broadcast?
    Device.current &&
      !self.saved_changes.except(*self.class::DONT_BROADCAST).empty?
  end

  def maybe_broadcast(*args_)
    self.broadcast_changes(changes) if broadcast?
  end

  def broadcast_payload
    { body: self.as_json }.to_json
  end

  def chan_name
    "sync.#{self.class.name}.#{self.id}"
  end

  def broadcast_changes(changes)
    Transport.send(broadcast_payload, Device.current.id)
  end
end
