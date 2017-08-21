class DeviceSerializer < ActiveModel::Serializer
  attributes :id, :url, :updated_at, :created_at
end
