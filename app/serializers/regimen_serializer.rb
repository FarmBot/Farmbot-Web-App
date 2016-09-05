class RegimenSerializer < ActiveModel::Serializer
  attributes :id, :name, :color, :device_id
  has_many :regimen_items
end
