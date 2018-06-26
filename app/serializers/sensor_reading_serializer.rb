class SensorReadingSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :pin, :value, :x, :y, :z
end
