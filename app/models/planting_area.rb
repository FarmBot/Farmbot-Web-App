# The area within FarmBot's tracks.
class PlantingArea < ActiveRecord::Base
  has_many :plants
  belongs_to :device
end
