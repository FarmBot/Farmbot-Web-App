class PeripheralSerializer < ActiveModel::Serializer
  attributes :id, :device_id, :pin, :mode, :label
end
