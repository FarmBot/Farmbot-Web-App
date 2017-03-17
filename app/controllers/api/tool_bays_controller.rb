module Api
  class ToolBaysController < Api::AbstractController
    def show
      maybe_initialize_a_tool_bay
      render json: tool_bay
    end

    def index
      maybe_initialize_a_tool_bay
      render json: tool_bays
    end

    def update
      mutate ToolBays::Update.run(tool_bay_params)
    end

  private
    # PROBLEM: The UI does not offer a means of creating tool bays. You must
    # have a ToolBay to create a ToolSlot or Tool. Temporary fix: Create a
    # ToolBay in the background if the user does not have one.
    # TODO: Remove this when UI level creation of tool bays happens.
    def maybe_initialize_a_tool_bay
        ToolBay.create(device: current_device,
                       name: "Tool Bay 1") unless current_device.tool_bays.any?
    end

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
