module Api
  class GardensController < Api::AbstractController
    def index
      render json: current_device.gardens
    end

    def create
      mutate Gardens::Create.run(raw_json, device: current_device)
    end

    def update
      mutate Gardens::Update.run(raw_json, garden: garden, device: current_device)
    end

    def destroy
      render json: garden.destroy! && ""
    end

    private

    def garden
      @garden ||= current_device.gardens.find(params[:id])
    end
  end
end
