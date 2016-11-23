module Api
  class PlantingAreasController < Api::AbstractController

    def index
      render json: PlantingArea.where(device: current_device)
    end

    def create
      mutate PlantingAreas::Create.run(params.as_json, device: current_device)
    end

    def destroy
      if (planting_area.device == current_device) && planting_area.destroy
        render nothing: true
      else
        raise Errors::Forbidden, "Not your Planting Area."
      end
    end

    private

    def planting_area
      @planting_area ||= PlantingArea.find(params[:id])
    end
  end
end
