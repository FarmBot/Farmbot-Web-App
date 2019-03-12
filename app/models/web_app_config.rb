# Various convenience features and flags.
class WebAppConfig < ApplicationRecord
  belongs_to :device

  def internal_use=(data)
    unless [nil, "null"].include?(data)
      Rollbar.error("Internal data update use", {
        self_id: self.id,
        device_id: self.device_id,
      })
    end
    super(data)
  end

  def broadcast?
    false
  end
end
