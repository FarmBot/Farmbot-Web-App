
# Generates a tree of all syncable resources. Typically used by a FarmBot device
# for caching of resources. 
module Api
  class SyncsController < Api::AbstractController

    # GET /api/sync
    def show
      mutate Sync::Fetch.run(device: current_device)
    end
  end
end
