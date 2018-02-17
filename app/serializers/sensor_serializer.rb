class SensorSerializer < ActiveModel::Serializer
  attributes :id, :pin, :label, :mode
end
