class DeviceSerializer < ApplicationSerializer
  attributes :fb_order_number,
             :fbos_version,
             :indoor,
             :last_saw_api,
             :lat,
             :lng,
             :mounted_tool_id,
             :name,
             :ota_hour_utc,
             :ota_hour,
             :rpi,
             :serial_number,
             :setup_completed_at,
             :throttled_at,
             :throttled_until,
             :timezone,
             :max_log_age_in_days,
             :max_sequence_count,
             :max_sequence_length,
             :tz_offset_hrs
end
