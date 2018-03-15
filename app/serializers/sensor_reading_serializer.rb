class SensorReadingSerializer < ActiveModel::Serializer
  attributes :id, :pin, :value, :x, :y, :z
end
