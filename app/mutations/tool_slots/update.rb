module ToolSlots
  class Update < ToolSlots::Base
    required do
      model :device, class: Device
      model :tool_slot, class: ToolSlot
    end

    optional do
      integer :tool_id, nils: true, empty_is_nil: true
      string  :name
      integer :x
      integer :y
      integer :z
    end

    def execute
      tool_slot
        .point
        .update_attributes!(update_params) && tool_slot
    end

private

    def update_params
      tool_slot.assign_attributes(inputs.slice(:tool_id))
      inputs
        .slice(*Point::SHARED_FIELDS)
        .merge(pointer: tool_slot)
    end
  end
end
