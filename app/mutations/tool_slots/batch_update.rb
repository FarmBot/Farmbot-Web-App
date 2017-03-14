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
      ToolSlot.transaction do
        tool_slots.map { |p| update_tool_slot(p) }
      end
    end

  private

    def update_tool_slot(params)
      ts = ToolSlot.find(params.delete(:id))
      ts.update_attributes!(params) && ts
    end
  end
end
