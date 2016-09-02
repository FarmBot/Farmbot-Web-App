# The area inside of the FarmBot's tracks.
class PlantingArea < ActiveRecord::Base
  has_many :plants
  belongs_to :device

  # field :width, type: Integer, default: 600
  # field :length, type: Integer, default: 300

end
