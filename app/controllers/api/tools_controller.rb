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
      output[:name] = params[:name] if params[:name]
      output
    end

    def create_params
      if @create_params
        @create_params
      else
        @create_params = { name: params[:name],
                          device: current_device }
        @create_params
      end
    end

    def tools
      Tool.where(device: current_device)
    end

    def tool
      @tool ||= tools.find(params[:id])
    end
  end
end