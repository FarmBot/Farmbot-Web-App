module Tools
  class Destroy < Mutations::Command
    STILL_IN_USE = "Can't delete tool or seed container because the " \
                   "following sequences are still using it: %s"
    STILL_IN_SLOT = "Can't delete tool or seed container because it is " \
                    "still in a slot. Please remove it from the slot first."

    required do
      model :tool, class: Tool
    end

    def validate
      any_deps?
      any_slots?
    end

    def execute
      maybe_unmount_tool
      tool.destroy!
    end

    private

    def slot
      @slot ||= tool.tool_slot
    end

    def any_slots?
      add_error :tool, :in_slot, STILL_IN_SLOT if slot.present?
    end

    def any_deps?
      add_error :tool, :in_use, STILL_IN_USE % [names] if names.present?
    end

    def names
      @names ||=
        InUseTool.where(tool_id: tool.id).pluck(:sequence_name).join(", ")
    end

    def maybe_unmount_tool
      if tool.device.mounted_tool_id == tool.id
        tool.device.update!(mounted_tool_id: nil)
      end
    end
  end
end
