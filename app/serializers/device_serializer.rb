class DeviceSerializer < ActiveModel::Serializer
  attributes :id, :name, :uuid, :token
end
