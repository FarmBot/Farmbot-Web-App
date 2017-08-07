class DeviceSerializer < ActiveModel::Serializer
  attributes :id, :name, :webcam_url, :timezone, :last_seen
end
