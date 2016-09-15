class DeviceSerializer < ActiveModel::Serializer
  attributes :id, :name, :uuid, :webcam_url
end
