# Not to be confused with "plants"- This is used for garden planning and does
# not represent a real plant in the dirt.
class PlantTemplate < ApplicationRecord
  belongs_to :device
  belongs_to :saved_garden
end
