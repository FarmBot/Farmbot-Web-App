class RegimenSerializer < ActiveModel::Serializer
  attributes :id, :name, :color, :device_id, :regimen_items
end
