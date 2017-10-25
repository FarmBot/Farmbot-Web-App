class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true
  after_save :maybe_broadcast, on: [:create, :update, :destroy]

  DONT_BROADCAST = [ "current_sign_in_at",
                     "last_sign_in_at",
                     "sign_in_count",
                     "updated_at",
                     "created_at" ]

  def maybe_broadcast(*args_)
    changes = self.saved_changes.except(*self.class::DONT_BROADCAST)
    self.broadcast_changes(changes) unless changes.empty?
  end

  def broadcast_changes(changes)
    Transport.send(self.as_json.to_json, Device.current, "sync") if Device.current
  end
end
