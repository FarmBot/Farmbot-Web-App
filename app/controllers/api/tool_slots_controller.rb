module Api
  class ToolSlotsController < Api::AbstractController

    def create
    if (raw_json && raw_json.is_a?(Hash) && raw_json[:tool_slots])
        mutate ToolSlots::BatchUpdate.run(raw_json, device: current_device)
      else
        mutate ToolSlots::Create.run(tool_slot_params)
      end
    end

    def show
      render json: tool_slot
    end

    def index
      render json: tool_slots.map(&:pointer)
    end

    def update
      mutate ToolSlots::Update.run(tool_slot_params)
    end

    def destroy
      mutate ToolSlots::Destroy.run(tool_slot: tool_slot)
    end

  private

    def tool_slots
        @tool_slots ||= Point.where(device_id: current_device,
                                    pointer_type: "ToolSlot")
    end

    def tool_slot
      @tool_slot ||= tool_slots.find_by!(pointer_id: params[:id]).pointer
    end

    def tool_slot_params
      ts = (params[:id] ? tool_slot : nil)
      @tool_slot_params ||= raw_json
                              .merge({ device: current_device, tool_slot: ts })
    end
  end
end
