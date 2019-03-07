# Various convenience features and flags.
class WebAppConfig < ApplicationRecord
  belongs_to :device

  def internal_use=(data)
    Rollbar.error("Internal data update use", { object_id: self.id })
    super(data)
  end

  def broadcast?
    false
  end
end
