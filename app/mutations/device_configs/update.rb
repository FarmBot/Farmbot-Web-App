module DeviceConfigs
  class Update < Mutations::Command
    required {
      model :config, class: DeviceConfig
    }

    optional do
      string :key
      duck   :value, methods: [:to_json]
    end

    def execute
      config.update_attributes!(inputs.except(:config)) && config
    end
  end
end
