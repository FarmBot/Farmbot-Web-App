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
      mutate Tools::Update.run(update_params)
    end

private

    def update_params
      output = {tool: tool}
      output[:name]      = params[:name] if params[:name]
      output[:tool_slot] = tool_slot     if params[:tool_slot_id]
      output
    end

    def create_params
      if @create_params
        @create_params
      else
        tsid = params[:tool_slot_id]
        @create_params = { name: params[:name],
                          device: current_device }
        @create_params[:tool_slot_id] = tsid if tsid
        @create_params
      end
    end

    def q
      @q ||= ToolBay::DeviceQuery.new(current_device)
    end

    def tool_slot
      q.find(:tool_slots, params[:tool_slot_id])
    end

    def tools
      q.tools
    end

    def tool
      puts "FIX THIS NOW!!"
      @tool ||= Tool.find(params[:id])
    end
  end
end