module ToolSlots
  class Create < Mutations::Command
    FIELDS = [:tool_id, :pullout_direction, :x, :y, :z, :name, :device]

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
      ToolSlot.create!(inputs.slice(*FIELDS))
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
