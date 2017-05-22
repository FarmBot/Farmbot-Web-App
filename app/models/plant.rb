# A single organism living in the ground.
class Plant < ActiveRecord::Base
  DEFAULT_ICON = "/app-resources/img/icons/generic-plant.svg"
  has_one :point, as: :pointer#, dependent: :destroy
end
