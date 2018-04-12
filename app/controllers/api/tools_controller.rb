module Api
  class ToolsController < Api::AbstractController
    INDEX_QUERY = 'SELECT "tools".*, points.id as tool_slot_id FROM "tools" '  \
                  'INNER JOIN "points" ON "points"."tool_id" = "tools"."id" '  \
                  'AND "points"."pointer_type" IN (\'ToolSlot\') WHERE "tools"'\
                  '."device_id" = %s;'

    def index
      render json: tools
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
      Tool.find_by_sql(INDEX_QUERY % current_device.id)
    end

    def tool
      @tool ||= Tool.where(device: current_device).find(params[:id])
    end
  end
end
