module Api
  class ToolsController < Api::AbstractController
    def index
      maybe_paginate tools
    end

    def show
      render json: tool
    end

    def destroy
      mutate Tools::Destroy.run(tool: tool)
    end

    def create
      mutate Tools::Create.run(raw_json, device: current_device)
    end

    def update
      mutate Tools::Update.run(update_params)
    end

    private

    def update_params
      output = raw_json.merge(tool: tool)
      output[:name] = params[:name] if params[:name]
      output
    end

    def tools
      @tools ||= Tool.outer_join_slots(current_device.id)
    end

    def tool
      @tool ||= Tool.join_tool_slot_and_find_by_id(params[:id].to_i)
    end
  end
end
