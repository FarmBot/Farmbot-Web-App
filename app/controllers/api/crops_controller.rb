module Api
  class CropsController < Api::AbstractController

    def index
      render json: Crop.where(device: current_device)
    end

    def create
      mutate Crops::Create.run(params, device: current_device)
    end

    def destroy
      if (crop.device == current_device) && crop.destroy
        render nothing: true
      else
        raise Errors::Forbidden, "Not your Crop object."
      end
    end

    private

    def crop
      @crop ||= Crop.find(params[:id])
    end
  end
end
