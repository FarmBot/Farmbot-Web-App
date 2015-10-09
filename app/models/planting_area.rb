# The area inside of the FarmBot's tracks.
class PlantingArea
  include Mongoid::Document

  field :width, type: Integer, default: 600
  field :length, type: Integer, default: 300

  has_many :plants
  belongs_to :device
end
