module Api
  class PlantsController < Api::AbstractController

    def index
      render json: Plant
        .joins(:point)
        .where("points.device_id = ?", current_device.id)
    end

    def create
      mutate Plants::Create.run(params.as_json, device_params)
    end

    def update
      mutate Plants::Update.run(params.as_json,
                                { plant: plant },
                                device_params)
    end

    def destroy
      render json: plant.destroy! && ""
    end

    private

    def plant_points
      Point
         .where(device_params)
         .where(pointer_type: "Plant")
    end

    def device_params
      @device_params ||= {device: current_device}
    end

    def plant
      puts "OPTIMIZE THESE HACKS"
      @plant ||= plant_points
                   .find_by!(pointer_id: params[:id])
                   .pointer
    end
  end
end
