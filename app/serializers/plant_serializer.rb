class PlantSerializer < ActiveModel::Serializer
  attributes :id, :x, :y, :radius, :name, :openfarm_slug,
             :created_at, :device_id
end
