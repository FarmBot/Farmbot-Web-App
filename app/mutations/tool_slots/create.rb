module ToolSlots
  class Create < Mutations::Command
    required do
      model   :device, class: Device
      string  :name, default: "Untitled Slot"
      integer :x
      integer :y
      integer :z
    end

    optional do
      integer :tool_id, empty: true
      integer :pullout_direction,
                min: ToolSlot::PULLOUT_DIRECTIONS.min,
                max: ToolSlot::PULLOUT_DIRECTIONS.max
    end

    def validate
      validate_tool
    end

    def execute
      Point
        .create!(inputs.slice(:x,:y,:z,:name, :device).merge(pointer: pointer))
    end

    def pointer
      ToolSlot.new(inputs.slice(:tool_id, :pullout_direction))
    end

    def has_tool_id
      !!tool_id
    end

    def validate_tool
      if has_tool_id && !device.tools.where(id: tool_id).any?
        add_error :tool_id,
                  :not_found,
                  "Can't find tool with id #{tool_id}"
      end
    end
  end
end
