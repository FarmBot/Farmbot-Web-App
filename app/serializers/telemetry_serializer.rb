class TelemetrySerializer < ApplicationSerializer
  attributes :soc_temp,
             :throttled,
             :wifi_level_percent,
             :uptime,
             :memory_usage,
             :disk_usage,
             :cpu_usage,
             :target,
             :fbos_version,
             :firmware_hardware

  def created_at
    object.created_at.to_time.to_i
  end
end
