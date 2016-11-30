module Api
  class ToolsController < Api::AbstractController
    def index
      render json: tools
    end

    def show
      render json: tool
    end

    def destroy
      tool.destroy!
      render json: ""
    end

    def create
      mutate Tools::Create.run(create_params)
    end

    def update
        raise "Not implemented yet"
    end

private

    def create_params
      {name: params[:name], tool_slot: q.find(:tool_slots, params[:tool_slot_id]) }
    end

    def q
      @q ||= ToolBay::DeviceQuery.new(current_device)
    end

    def tools
      q.tools
    end

    def tool
      q.find(:tools, params[:id])
    end
  end
end