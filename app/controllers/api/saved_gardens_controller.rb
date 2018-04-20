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
      mutate SavedGardens::SnapShot.run(params.as_json, device: current_device)
    end

    def apply
      mutate SavedGardens::Apply
        .run(garden: garden, device: current_device, destructive: false)
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
