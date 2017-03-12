# A single organism living in the ground (planting_area)
class Plant < ActiveRecord::Base
  DEFAULT_ICON = "/app-resources/img/icons/generic-plant.svg"
  belongs_to :device
  belongs_to :planting_area
end
