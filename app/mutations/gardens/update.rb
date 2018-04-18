module Gardens
  class Update < Mutations::Command
    required do
      model :garden, class: Garden
    end

    optional do
      string :name
    end

    def execute
      garden.update_attributes!(inputs.except(:garden))
      garden
    end
  end
end
