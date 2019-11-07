class DeviceSerializer < ApplicationSerializer
  attributes :fbos_version,
             :last_ota_checkup,
             :last_ota,
             :last_saw_api,
             :last_saw_mq,
             :mounted_tool_id,
             :name,
             :ota_hour,
             :serial_number,
             :throttled_at,
             :throttled_until,
             :timezone,
             :tz_offset_hrs
end
