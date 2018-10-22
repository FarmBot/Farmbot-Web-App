module Devices
  class Sync < Mutations::Command
    FIELDS    = [ :id, :updated_at ]
    PLURAL    = [ :farm_events,
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
      base = { now:              Time.now.utc, # Clock skew detector?
               devices:          pluck(device),
               fbos_configs:     pluck(device.fbos_config),
               firmware_configs: pluck(device.firmware_config), }
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
