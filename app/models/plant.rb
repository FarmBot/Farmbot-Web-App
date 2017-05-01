# A single organism living in the ground.
class Plant < ActiveRecord::Base
  DEFAULT_ICON = "/app-resources/img/icons/generic-plant.svg"
  belongs_to :device
end
