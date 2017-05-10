module Api
  class PlantsController < Api::AbstractController

    def index
      render json: []
    end

    # def create
    #   mutate Plants::Create.run(params.as_json, device_params)
    # end

    # def update
    #   mutate Plants::Update.run(params.as_json,
    #                             { plant: plant },
    #                             device_params)
    # end

    # def destroy
    #   render json: plant.destroy! && ""
    # end

    # private

    # def plants
    #   Plant
    #     .joins(:point)
    #     .where("points.device_id = ?", current_device.id)
    # end

    # def device_params
    #   @device_params ||= {device: current_device}
    # end

    # def plant
    #   @plant ||= plants.find_by("points.pointer_id = ?", params[:id])
    # end
  end
end
