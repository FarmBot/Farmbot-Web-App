module Devices
  class Sync < Mutations::Command
    FIELDS    = [ :id, :updated_at ]
    PLURAL    = [ :diagnostic_dumps,
                  :farm_events,
                  :farmware_envs,
                  :farmware_installations,
                  :peripherals,
                  :pin_bindings,
                  :points,
                  :regimens,
                  :sensor_readings,
                  :sensors,
                  :sequences,
                  :tools ]

    required do
      model   :device, class: Device
    end

    def execute
      base = { now:             Time.now.utc, # Clock skew detector?
               device:          pluck(device),
               fbos_config:     pluck(device.fbos_config),
               firmware_config: pluck(device.firmware_config), }
      PLURAL.reduce(base) do |json, resource|
        json.update(resource => device.send(resource).pluck(*FIELDS))
      end
    end

private

    def pluck(obj)
      [[obj.id, obj.updated_at]]
    end
  end
end
