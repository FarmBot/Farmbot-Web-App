module ToolSlots
  class Create < ToolSlots::Base
    required do
      model   :device, class: Device
    end

    optional do
      integer :tool_id
      string  :name
      integer :x
      integer :y
      integer :z
    end

    def validate
      validate_tool
    end

    def execute
      ToolSlot.create!(inputs.except(:device))
    end
  end
end
