# Various convenience features and flags.
class WebAppConfig < ApplicationRecord
  belongs_to :device

  def broadcast?
    false
  end
end
