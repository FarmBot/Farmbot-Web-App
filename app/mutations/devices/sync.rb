module Devices
  class Sync < Mutations::Command
    SEL     = "SELECT id, updated_at FROM"
    WHERE   = "WHERE device_id = "
    WHERE2  = "devices WHERE id = "
    QUERIES = {
      devices:                [SEL,                          WHERE2].join(" "),
      farm_events:            [SEL, "farm_events",            WHERE].join(" "),
      farmware_envs:          [SEL, "farmware_envs",          WHERE].join(" "),
      farmware_installations: [SEL, "farmware_installations", WHERE].join(" "),
      peripherals:            [SEL, "peripherals",            WHERE].join(" "),
      pin_bindings:           [SEL, "pin_bindings",           WHERE].join(" "),
      points:                 [SEL, "points",                 WHERE].join(" "),
      regimens:               [SEL, "regimens",               WHERE].join(" "),
      sensor_readings:        [SEL, "sensor_readings",        WHERE].join(" "),
      sensors:                [SEL, "sensors",                WHERE].join(" "),
      sequences:              [SEL, "sequences",              WHERE].join(" "),
      tools:                  [SEL, "tools",                  WHERE].join(" "),
      fbos_configs:           [SEL, "fbos_configs",           WHERE].join(" "),
      firmware_configs:       [SEL, "firmware_configs",       WHERE].join(" "),
    }

    required { model :device, class: Device }

    def execute
      conn    = ActiveRecord::Base.connection
      QUERIES.reduce({}) do |acc, (key, value)|
        acc.update(key => conn.execute(value + device.id.to_s).values)
      end
    end
  end
end
