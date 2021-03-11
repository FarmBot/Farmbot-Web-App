class DeviceSerializer < ApplicationSerializer
  attributes :fbos_version,
             :fb_order_number,
             :last_saw_api,
             :setup_completed_at,
             :mounted_tool_id,
             :name,
             :ota_hour,
             :ota_hour_utc,
             :serial_number,
             :throttled_at,
             :throttled_until,
             :timezone,
             :tz_offset_hrs
end
