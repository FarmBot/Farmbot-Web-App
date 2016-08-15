class RegimenSerializer < ActiveModel::Serializer
  attributes :_id, :name, :color, :device_id, :regimen_items
end
