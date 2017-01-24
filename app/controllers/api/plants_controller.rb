module Api
  class PlantsController < Api::AbstractController

    def index
      render json: Plant.where(device_params)
    end

    def create
      mutate Plants::Create.run(params.as_json, device_params)
    end

    def update
      mutate Plants::Update.run(params.as_json, device_params)
    end

    def destroy
      render json: plant.destroy! && ""
    end

    private

    def plants
      Plant.where(device_params)
    end

    def device_params
      @device_params ||= {device: current_device}
    end

    def plant
      @plant ||= plants.find(params[:id])
    end
  end
end
