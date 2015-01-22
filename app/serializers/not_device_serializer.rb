class DeviceSerializer < ActiveModel::Serializer
  attributes :_id, :name, :uuid, :token
end
