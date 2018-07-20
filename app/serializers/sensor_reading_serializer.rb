class SensorReadingSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :mode, :pin, :value, :x, :y, :z
end
