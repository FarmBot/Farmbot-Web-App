module Api
  class PlantsController < Api::AbstractController

    def index
      render json: Plant.where(device: current_device)
    end

    def create
      mutate Plants::Create.run(params, device: current_device)
    end

    def destroy
      if (crop.device == current_device) && crop.destroy
        render nothing: true
      else
        raise Errors::Forbidden, "Not your Plant object."
      end
    end

    private

    def crop
      @crop ||= Plant.find(params[:id])
    end
  end
end
