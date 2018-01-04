module Tools
  class Update < Mutations::Command
    required do
      model   :tool, class: Tool
    end

    optional do
      integer :pullout_direction,
                min: Tool::PULLOUT_DIRECTIONS.min,
                max: Tool::PULLOUT_DIRECTIONS.max
      string :name
    end

    def execute
      tool.update_attributes!(inputs.except(:tool)) && tool
    end
  end
end
