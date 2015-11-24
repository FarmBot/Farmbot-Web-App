module Api
  class PlantsController < Api::AbstractController

    def index
      render json: Plant.where(device_params)
    end

    def create
      mutate Plants::Create.run(params, device_params)
    end

    def destroy
      if (plant.device == current_device) && plant.destroy
        render nothing: true
      else
        raise Errors::Forbidden, "Not your Plant object."
      end
    end

    private

    def device_params
      @device_params ||= {device: current_device}
    end

    def plant
      @plant ||= Plant.find(params[:id])
    end
  end
end
