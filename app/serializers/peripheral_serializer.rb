class PeripheralSerializer < ActiveModel::Serializer
  attributes :pin, :mode, :label
end
