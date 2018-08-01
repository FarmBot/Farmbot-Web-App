module DeviceConfigs
  class Update < Mutations::Command
    required {
      model :device_config, class: DeviceConfig
    }

    optional do
      string :key
      duck   :value, methods: [:to_json]
    end

    def execute
      device_config.update_attributes!(inputs.except(:device_config)) && device_config
    end
  end
end
