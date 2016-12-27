# A single organism living in the ground (planting_area)
class Plant < ActiveRecord::Base
  belongs_to :device
  belongs_to :planting_area
end
