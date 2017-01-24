class PlantSerializer < ActiveModel::Serializer
  attributes :id, :x, :y, :name, :img_url, :icon_url, :openfarm_slug,
             :created_at, :device_id, :planting_area_id
end
