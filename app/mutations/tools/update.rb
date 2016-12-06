module Tools
  class Update  < Tools::Base
    required do
      model :tool, class: Tool
    end

    optional do
      string :name
      integer :tool_slot_id
    end

    def validate
      bad_tool_slot_id! if tool_slot_id && !tool_slot
      forbidden! if tool_slot_id && !it_is_your_tool_slot
    end

    def execute
      tool.update_attributes!(inputs.except(:tool)) && tool
    end
  end
end
