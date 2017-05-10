module Api
  class PointsController < Api::AbstractController
    class BadPointerType < StandardError; end
    BAD_POINTER_TYPE =     <<~XYZ
      Please provide a JSON object with a `pointer_type` that matches one
      of the following values: %s
    XYZ

    rescue_from BadPointerType do |exc|
      sorry BAD_POINTER_TYPE % [Point::POINTER_KINDS.keys.join(", ")], 422
    end

    def index
      render json: points
    end

    def search
      mutate Points::Query.run(raw_json, device_params)
    end

    def create
      mutate (case raw_json&.dig(:pointer_type)
        when "GenericPointer" then Points::Create
        when "ToolSlot"       then ToolSlots::Create
        when "Plant"          then Plants::Create
        else
          raise BAD_POINTER_TYPE
      end).run(raw_json, device_params)
    end

    def update
      mutate Points::Update.run raw_json, { point: point }, device_params
    end

    def destroy
      points.where(id: params[:id].to_s.split(",")).destroy_all
      render json: ""
    end

    private

    def point
      @point ||= points.find(params[:id])
    end

    def points
      Point.where(device_params)
    end

    def device_params
      @device_params ||= {device: current_device}
    end

    def tool_slots
      @tool_slots ||= ToolSlot
                        .joins(:point)
                        .where("points.device_id = ?", current_device.id)
    end

    def tool_slot
      @tool_slot ||= tool_slots.find_by!(id: params[:id])
    end

    def tool_slot_params
      ts = (params[:id] ? tool_slot : nil)
      @tool_slot_params ||= raw_json
                              .merge({ device: current_device, tool_slot: ts })
    end
  end
end
