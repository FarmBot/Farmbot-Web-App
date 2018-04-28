module Devices
  class Dump < Mutations::Command
    RESOURCES = [
      :device_configs,
      :farm_events,
      :images,
      :logs,
      :peripherals,
      :pin_bindings,
      :plant_templates,
      :points,
      :regimens,
      :saved_gardens,
      :sensor_readings,
      :sensors,
      :sequences,
      :token_issuances,
      :tools,
      :users,
      :webcam_feeds,
    ]
    def self.run_by_id(id)
      Devices::Dump.delay.run!(device_id: current_device)
    end

    required do
      integer :device_id
    end

    def execute
      output = { device: device.body_as_json }
      RESOURCES.eah do |name|
        model        = device.send(name)
        output[name] = \
          model.try(:map) { |x| x.body_as_json } || x.body_as_json
      end
      output
    end

  private

    def device
      @device ||= Device.find(device_id)
    end
  end
end
