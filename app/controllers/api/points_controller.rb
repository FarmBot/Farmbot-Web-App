module Api
  class PointsController < Api::AbstractController

    def index
      render json: points
    end

    def search
      mutate Points::Query.run(raw_json, device_params)
    end

    def create
      mutate Points::Create.run(raw_json, device_params)
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
  end
end
