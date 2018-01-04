module Tools
  class Create < Mutations::Command
    required do
      string  :name
      model   :device, class: Device
    end

    optional do
      integer :pullout_direction,
                min: Tool::PULLOUT_DIRECTIONS.min,
                max: Tool::PULLOUT_DIRECTIONS.max
    end

    def execute
      Tool.create!(inputs)
    end
  end
end
