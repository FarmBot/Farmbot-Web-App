class PlantTemplate < ApplicationRecord
  belongs_to :device
  belongs_to :saved_garden
end
