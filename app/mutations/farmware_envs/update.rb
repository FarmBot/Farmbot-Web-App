module FarmwareEnvs
  class Update < Mutations::Command
    required do
      model :farmware_env, class: FarmwareEnv
    end

    optional do
      string :key
      duck :value, methods: [:to_json]
    end

    def execute
      farmware_env.update!(inputs.except(:farmware_env)) && farmware_env
    end
  end
end
