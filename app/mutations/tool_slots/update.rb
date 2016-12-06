module ToolSlots
  class Update < ToolSlots::Base
    required do
      model :device, class: Device
      model :tool_slot, class: ToolSlot
    end

    optional do
      integer :tool_id
      string  :name
      integer :x
      integer :y
      integer :z
    end

    def execute
      tool_slot.update_attributes!(update_params) && tool_slot
    end

private

    def update_params
      inputs.except(:device, :tool_slot)
    end
  end
end
