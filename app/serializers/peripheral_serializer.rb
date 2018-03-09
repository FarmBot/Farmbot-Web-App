class PeripheralSerializer < ActiveModel::Serializer
  attributes :id, :pin, :label, :mode
end
