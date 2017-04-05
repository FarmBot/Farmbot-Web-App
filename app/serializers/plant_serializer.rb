class PlantSerializer < ActiveModel::Serializer
  attributes :id, :x, :y, :radius, :name, :img_url, :openfarm_slug,
             :created_at, :device_id, :planting_area_id
end
