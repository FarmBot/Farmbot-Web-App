module Api
  class ToolSlotsController < Api::AbstractController

    def create
      mutate ToolSlots::Create.run(tool_slot_params)      
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
      tool_slot.destroy!
      render json: ""
    end
  
  private

    def q
      @q ||= ToolBay::DeviceQuery.new(current_device)
    end

    def tool_slots
        @tool_slots ||= q.tool_slots
    end

    def tool_slot
      @tool_slot ||= tool_slots.find{ |s| s.id == params.fetch(:id, "").to_i }
    end
  
    def tool_slot_params
      if @tool_slot_params
        @tool_slot_params
      else
        @tool_slot_params             = {device: current_device}
        @tool_slot_params[:tool_slot] = tool_slot     if params[:id]
        @tool_slot_params[:name]      = params[:name] if params[:name]
        @tool_slot_params[:x]         = params[:x]    if params[:x]
        @tool_slot_params[:y]         = params[:y]    if params[:y]
        @tool_slot_params[:z]         = params[:z]    if params[:z]

        @tool_slot_params
      end
    end
  end
end