# A single organism living in the ground.
class Plant < ActiveRecord::Base
  # DEFAULT_ICON = "/app-resources/img/icons/generic-plant.svg"
  belongs_to :device
  belongs_to :point
  delegate :x, to: :point
  delegate :y, to: :point
  delegate :radius, to: :point
end
