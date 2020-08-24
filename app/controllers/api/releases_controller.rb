module Api
  # ReleasesController accepts device information from an FBOS
  # device seeking to update its firmware.
  # It uses the information provided by FBOS to provide meta
  # data about the next appropriate release.
  class ReleasesController < Api::AbstractController
    skip_before_action :authenticate_user!, only: [:show]
    NONE = "none"
    PLATFORMS = [
      GENESIS = "rpi3",
      EXPRESS = "rpi",
    ].join(", ")
    BAD_PLATFORM = "%s is not a valid platform. Valid options: #{PLATFORMS}"

    # POST /api/releases
    def create
      raise "Use GH Releases web hook?"
    end

    # GET /api/releases
    # TODO: If this needs more than one input param, extract
    # into a mutation.
    def show
      platform = params["platform"] || NONE
      case platform
      when GENESIS
        url = "https://github.com/FarmBot/farmbot_os/releases/download/v11.0.1/farmbot-rpi3-11.0.1.img"
        render json: { image_url: url }
      when EXPRESS
        url = "https://github.com/FarmBot/farmbot_os/releases/download/v11.0.1/farmbot-rpi-11.0.1.img"
        render json: { image_url: url }
      when NONE
        platform_missing(platform)
      else
        Rollbar.error("Bad FBOS platform?", { platform: platform })
        platform_missing(platform)
      end
    end

    private

    def platform_missing(platform)
      err = { error: BAD_PLATFORM % [platform] }
      render json: err, status: 404
    end

    # def get_release(platform)
    #   Release
    #     .order(:created_at)
    #     .reverse_order
    #     .where(platform: platform)
    #     .first
    # end
  end
end
