module ToolSlots
  class Create < ToolSlots::Base
    required do
      model   :device, class: Device
    end

    optional do
      integer :tool_id
      string  :name, default: "Untitled Slot"
      integer :x
      integer :y
      integer :z
    end

    def validate
      validate_tool
    end

    def execute
      Point
        .create!(inputs.slice(:x,:y,:z,:name, :device).merge(pointer: pointer))
    end

    def pointer
      ToolSlot.new(inputs.slice(:tool_id))
    end
  end
end
