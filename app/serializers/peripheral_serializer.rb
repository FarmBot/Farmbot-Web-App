class PeripheralSerializer < ActiveModel::Serializer
  attributes :id, :pin, :mode, :label
end
