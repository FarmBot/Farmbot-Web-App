module ToolSlots
  class Create < Mutations::Command
    required do
      model :device, class: Device
      integer :tool_bay_id
    end

    optional do
      integer :tool_id
      string :name
      integer :x
      integer :y
      integer :z
    end

    def validate
      if !device.tool_bays.where(id: tool_bay_id).any?
        add_error :tool_bay_id,
                  :not_found,
                  "Can't find tool bay with id #{tool_bay_id}"
      end
    end

    def execute
      ToolSlot.create!(inputs.except(:device))
    end
  end
end
