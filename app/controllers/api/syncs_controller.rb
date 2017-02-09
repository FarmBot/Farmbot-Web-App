module Api
  class SyncsController < Api::AbstractController

    # GET /api/sync
    def show
      mutate Sync::Fetch.run(device: current_device)
    end
  end
end
