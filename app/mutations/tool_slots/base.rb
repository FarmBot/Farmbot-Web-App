module ToolSlots
  class Base < Mutations::Command
    def has_tool_id
      !!tool_id
    end

    def owns_tool
      device.tools.where(id: tool_id).any?
    end

    def validate_tool
      if has_tool_id && !owns_tool
        add_error :tool_id,
                  :not_found,
                  "Can't find tool with id #{tool_id}"
      end
    end
  end
end
