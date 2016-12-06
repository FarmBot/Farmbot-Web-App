module Tools
  class Create  < Tools::Base
    required do
      string :name
      model :device, class: Device
    end

    optional do
      integer :tool_slot_id 
    end

    def validate
      bad_tool_slot_id! if tool_slot_id && !tool_slot
      forbidden! if tool_slot_id && !it_is_your_tool_slot
    end

    def execute
      Tool.create!(inputs)
    end
  end
end
