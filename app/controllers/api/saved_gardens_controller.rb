module Api
  class SavedGardensController < Api::AbstractController
    def index
      render json: current_device.saved_gardens
    end

    def create
      mutate SavedGardens::Create.run(raw_json, device: current_device)
    end

    def update
      mutate SavedGardens::Update.run(raw_json, saved_garden: garden, device: current_device)
    end

    def destroy
      render json: garden.destroy! && ""
    end

    def snapshot
      mutate SavedGardens::SnapShot.run(raw_json, device: current_device)
    end

    private

    def gardens
      @gardens ||= current_device.saved_gardens
    end

    def garden
      @garden ||= gardens.find(params[:id])
    end
  end
end
