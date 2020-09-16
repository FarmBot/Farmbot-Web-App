module Api
  # ReleasesController accepts device information from an FBOS
  # device seeking to update its firmware.
  # It uses the information provided by FBOS to provide meta
  # data about the next appropriate release.
  class ReleasesController < Api::AbstractController
    RELEVANT_FIELDS = [:image_url, :version, :platform, :channel, :id]

    # GET /api/releases
    def show
      mutate Releases::Calculate.run(device: current_device,
                                     platform: params[:platform])
    end
  end
end
