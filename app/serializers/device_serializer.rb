class DeviceSerializer < ActiveModel::Serializer
  attributes :id, :name, :timezone, :last_saw_api, :last_saw_mq, :tz_offset_hrs,
             :fbos_version, :throttled_until, :throttled_at
end
