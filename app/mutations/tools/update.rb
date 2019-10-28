module Tools
  class Update < Mutations::Command
    required do
      model   :tool, class: Tool
    end

    optional do
      string :name
    end

    def execute
      tool.update!(inputs.except(:tool)) && tool
    end
  end
end
