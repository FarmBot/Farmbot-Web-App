module Tools
  class Update < Mutations::Command
    required do
      model   :tool, class: Tool
    end

    optional do
      integer :pullout_direction, in: Tool::PULLOUT_DIRECTIONS
      string :name
    end

    def execute
      binding.pry
      tool.update_attributes!(inputs.except(:tool)) && tool
    end
  end
end
