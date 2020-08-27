module Api
  # ReleasesController accepts device information from an FBOS
  # device seeking to update its firmware.
  # It uses the information provided by FBOS to provide meta
  # data about the next appropriate release.
  class ReleasesController < Api::AbstractController
    skip_before_action :authenticate_user!, only: [:show]
    NONE = "none"
    PLATFORMS = Release::PLATFORMS.join(", ")
    BAD_PLATFORM = "%s is not a valid platform. Valid options: #{PLATFORMS}"
    DEFAULT_PARAMS = { platform: NONE, channel: "stable" }
    RELEVANT_FIELDS = [:image_url, :version, :platform, :channel, :id]

    # GET /api/releases
    def show
      if params[:platform]
        render json: release
      else
        sorry "A `platform` param is required", 422
      end
    end

    private

    def relevant_params
      @relevant_params ||= params.as_json.symbolize_keys.slice(*RELEVANT_FIELDS)
    end

    def show_params
      @show_params ||= DEFAULT_PARAMS.merge(relevant_params)
    end

    def release
      @release ||= Release.order(created_at: :desc).find_by!(show_params)
    end
  end
end
