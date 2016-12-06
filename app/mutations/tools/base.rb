module Tools
  class Base < Mutations::Command
    def it_is_your_tool_slot
      (tool_slot.tool_bay.device_id == device.id)
    end

    def tool_slot
      @tool_slot ||= ToolSlot.find_by(id: tool_slot_id)
    end

    def forbidden!
      raise Errors::Forbidden
    end

    def bad_tool_slot_id!
      add_error :tool_slot, :bad, "Bad tool slot ID"
    end
  end
end