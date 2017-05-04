module ToolSlots
  class BatchUpdate < Mutations::Command
    class Fail < Exception; end;
    required do
      model :device, class: Device
      array :tool_slots do
        hash do
          required do
            integer :id
          end

          optional do
            string  :name
            integer :x
            integer :y
            integer :z
            integer :tool_id, nils: true, empty_is_nil: true
          end
        end
      end
    end

    def execute
      Point.transaction do
        tool_slots.map { |p| update_tool_slot(p) }
      end
    end

  private

    def update_tool_slot(params)
      # TODO: This can be optimized.
      # LOOK AT THIS N+1 - FIX IT!
      # Grab all the tool_slots in one upfront query instead of inside an
      # iterator. - RC 4 May 17
      tool_slot = ToolSlot.find(params.delete(:id))
      x = params.slice(*Point::SHARED_FIELDS).merge(pointer: tool_slot)
      tool_slot.assign_attributes(params.slice(:tool_id))
      tool_slot.point.update_attributes!(x) && tool_slot.reload
    end
  end
end
