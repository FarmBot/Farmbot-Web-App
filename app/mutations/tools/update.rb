module Tools
  class Update  < Mutations::Command
    required do
      model :tool,      class: Tool
    end

    optional do
      string :name
      model :tool_slot, class: ToolSlot
    end

    def execute
      tool.update_attributes!(inputs.except(:tool)) && tool
    end
  end
end
