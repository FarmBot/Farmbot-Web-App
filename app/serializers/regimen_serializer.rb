class RegimenSerializer < ApplicationSerializer
  attributes :name, :color, :device_id
  has_many   :regimen_items
end
