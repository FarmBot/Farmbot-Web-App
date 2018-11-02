module FarmwareEnvs
  class Create < Mutations::Command
    LIMIT = Device::DEFAULT_MAX_CONFIGS

    required do
      model  :device, class: Device
      string :key
      duck   :value, methods: [:to_json]
    end

    def validate
      # Ensure you're not over the limit
      if device.farmware_envs.length >= LIMIT
        add_error :configs,
                  :configs,
                  "You are over the limit of #{LIMIT} Farmware Envs."
      end
    end

    def execute
      FarmwareEnv.create!(inputs)
    end
  end
end
