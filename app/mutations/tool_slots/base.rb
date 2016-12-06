module ToolSlots
  class Base < Mutations::Command
    def has_tool_id
      !!tool_id
    end
    
    def has_tool_bay
        # Verifies that the tool bay EXISTS and is owned by user.
      device.tool_bays.where(id: tool_bay_id).any?
    end

    def owns_tool
      devices.tools.where(id: tool_id).any?
    end

    def validate_bay
      add_error :tool_bay_id,
                :not_found,
                "Can't find tool bay with id #{tool_bay_id}" unless has_tool_bay
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
