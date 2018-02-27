module DeviceConfigs
  class Create < Mutations::Command
    LIMIT = Device::DEFAULT_MAX_CONFIGS

    required do
      model  :device, class: Device
      string :key
      duck   :value, methods: [:to_json]
    end

    def validate
      # Ensure you're not over the limit
      if device.device_configs.length >= LIMIT
        add_error :configs,
                  :configs,
                  "You are over the limit of #{LIMIT} configs."
      end
    end

    def execute
      DeviceConfig.create!(inputs)
    end
  end
end
