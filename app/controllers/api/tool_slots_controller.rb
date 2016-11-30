module Api
  class ToolSlotsController < Api::AbstractController
    def show
        render json: tool_slot
    end
  
    def index
        render json: tool_slots
    rescue => e
      binding.pry
    end
  
    def update
        mutate ToolSlots::Update.run(tool_slot_params)
    end
  
  private

    def q
      @q ||= ToolBay::DeviceQuery.new(current_device)
    end

    def tool_slots
        @tool_slots ||= q.tool_slots
    end

    def tool_slot
      @tool_slot ||= tool_slots.find(params[:id])
    end
  
    def tool_slot_params
        { device:    current_device,
          tool_slot: tool_slot,
          name:      params[:name],
          x:         params[:x],
          y:         params[:y],
          z:         params[:z] }
    end
  end
end