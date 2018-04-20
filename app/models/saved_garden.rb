class SavedGarden < ApplicationRecord
  belongs_to :device
  has_many   :plant_templates
end
