# A single organism living in the ground.
class Plant < ApplicationRecord
  DEFAULT_ICON = "/app-resources/img/icons/generic-plant.svg"
  has_one :point, as: :pointer#, dependent: :destroy

  def broadcast?
    false
  end
end
