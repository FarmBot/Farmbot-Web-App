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
      results = Devices::Dump.run!(device_id: id)
      raise "TODO: Email the `results` variable above as a JSON attachment."
    end

    required do
      integer :device_id
    end

    def execute
      output = { device: device.body_as_json }
      RESOURCES.each do |name|
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
