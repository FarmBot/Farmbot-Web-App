module Api
  class ToolSlotsController < Api::AbstractController

    def create
      if raw_json && raw_json[:tool_slots]
        mutate ToolSlots::BatchUpdate.run(raw_json, device: current_device)
      else
        mutate ToolSlots::Create.run(tool_slot_params)
      end
    end

    def show
        render json: tool_slot
    end

    def index
        render json: tool_slots
    end

    def update
        mutate ToolSlots::Update.run(tool_slot_params)
    end

    def destroy
      mutate ToolSlots::Destroy.run(tool_slot: tool_slot)
    end

  private

    def tool_slots
        @tool_slots ||= ToolSlot.where(tool_bay_id: current_device.tool_bays.pluck(:id))
    end

    def tool_slot
      @tool_slot ||= tool_slots.find(params[:id])
    end

    def tool_slot_params
      @tool_slot_params ||= raw_json.merge({ device: current_device,
                                            tool_slot: (params[:id] ?
                                                          tool_slot : nil) })
    end
  end
end
