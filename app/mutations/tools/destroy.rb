module Tools
  class Destroy < Mutations::Command
    STILL_IN_USE  = "Can't delete tool because the following sequences are "\
                    "still using it: %s"
    STILL_IN_SLOT = "Can't delete tool because it is still in a tool slot. "\
                    "Please remove it from the tool slot first."

    required do
      model :tool, class: Tool
    end

    def validate
      any_deps?
      any_slots?
    end

    def execute
      tool.destroy!
    end

    def any_slots?
      add_error :tool, :in_slot, STILL_IN_SLOT if ToolSlot.where(tool: tool).any?
    end

    def any_deps?
      add_error :tool, :in_use, STILL_IN_USE % [names] if names.present?
    end

    def names
      @names ||= \
        InUseTool.where(tool_id: tool.id).pluck(:sequence_name).join(", ")
    end
  end
end
