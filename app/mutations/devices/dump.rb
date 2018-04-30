module Devices
  class Dump < Mutations::Command
    RESOURCES = [ :device_configs, :farm_events, :images, :logs, :peripherals,
                  :pin_bindings, :plant_templates, :points, :regimens,
                  :saved_gardens, :sensor_readings, :sensors, :sequences,
                  :token_issuances, :tools, :users, :webcam_feeds ]

    required { model :device, class: Device }

    def execute
      output = { device: device.body_as_json }
      RESOURCES.each do |name|
        model        = device.send(name)
        output[name] = \
          model.try(:map) { |x| x.body_as_json } || x.body_as_json
      end
      output
    end
  end
end
