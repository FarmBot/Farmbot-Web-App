module Api
  class PointsController < Api::AbstractController
    class BadPointerType < StandardError; end
    BAD_POINTER_TYPE = <<~XYZ
      Please provide a JSON object with a `pointer_type` that matches one
      of the following values: %s
    XYZ

    rescue_from BadPointerType do |exc|
      sorry BAD_POINTER_TYPE % [Point::POINTER_KINDS.keys.join(", ")], 422
    end

    def index
      render json: points
    end

    def show
      render json: points.find(params[:id])
    end

    def search
      mutate Points::Query.run(raw_json, device_params)
    end

    def create
      mutate pointer_klass::Create.run(raw_json, device_params)
    end

    def update
      mutate Points::Update.run(raw_json, { point: point }, device_params)
    end

    def destroy
      ids = params[:id].to_s.split(",")
      mutate Points::Destroy.run({ points: points.find(ids) }, device_params)
    end

    private

    def pointer_klass
      case raw_json&.dig(:pointer_type)
        when "GenericPointer" then Points
        when "ToolSlot"       then ToolSlots
        when "Plant"          then Plants
        else;                 raise BadPointerType
      end
    end

    def point
      @point ||= points.find(params[:id])
    end

    def points
      Point.where(device_params)
    end

    def device_params
      @device_params ||= {device: current_device}
    end
  end
end
