class DeviceSerializer < ApplicationSerializer
  attributes  :fbos_version, :last_saw_api, :last_saw_mq,
              :mounted_tool_id, :name, :serial_number,
              :throttled_at, :throttled_until, :timezone,
              :tz_offset_hrs, :last_ota, :last_ota_checkup
end
