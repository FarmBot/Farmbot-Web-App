module FarmwareEnvs
  class Update < Mutations::Command
    required {
      model :farmware_env, class: FarmwareEnv
    }

    optional do
      string :key
      duck   :value, methods: [:to_json]
    end

    def execute
      farmware_env.update!(inputs.except(:farmware_env)) && farmware_env
    end
  end
end
