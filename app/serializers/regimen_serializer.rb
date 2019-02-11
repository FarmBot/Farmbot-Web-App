class RegimenSerializer < ApplicationSerializer
  attributes :name, :color, :device_id, :body
  has_many   :regimen_items
end
