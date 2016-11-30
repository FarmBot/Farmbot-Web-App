module Api
  class ToolBaysController < Api::AbstractController
    def show
        render json: tool_bay
    end
  
    def index
        binding.pry
        render json: tool_bays
    end
  
    def update
        mutate ToolBays::Update.run(tool_bay_params)
    end
  
  private
  
    def tool_bay
      @tool_bay ||= tool_bays.find(params[:id])
    end
  
    def tool_bay_params
        { device: current_device,
          tool_bay: tool_bay,
          name: params[:name] }
    end
  
    def tool_bays
        @tool_bays ||= current_device.tool_bays
    end
  end
end