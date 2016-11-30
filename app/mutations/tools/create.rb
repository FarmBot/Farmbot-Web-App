module Tools
  class Create  < Mutations::Command
    required do
      string :name
      model :tool_slot, class: ToolSlot
    end

    def execute
      Tool.create!(inputs)
    end
  end
end
