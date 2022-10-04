# FIND EXAMPLE JSON:
# curl -s https://api.github.com/repos/farmbot/farmbot_os/releases/latest
module Releases
  # Github has a JSON format for their own concept of "releases".
  # FarmBot also has a concept of a "release", but it is not the same schema.
  # A single Github release contains multiple "assets" (*.fw files) that
  # we must convert into multiple FarmBot Release objects.
  # 1 Github Release ==> multiple farmbot releases
  #
  # This class serves as a means of turning a Github release (JSON)
  # into an array of hashes that can be passed `Release::Create`.
  #
  # Example JSON can be downloaded via:
  # `curl -s https://api.github.com/repos/farmbot/farmbot_os/releases/latest`
  class Parse < Mutations::Command
    CONTENT_TYPE = "application/octet-stream"
    PREFIX = "farmbot"
    SUFFIX = ".fw"
    STATE = "uploaded"

    required do
      boolean :draft
      boolean :prerelease
      # "v11.0.1"
      string :tag_name
      array :assets do
        hash do
          # "farmbot-rpi-11.0.1.fw"
          string :name

          # "application/octet-stream"
          string :content_type

          # "uploaded"
          string :state

          # "https://github.com/FarmBot/farmbot_os/releases/download/v11.0.1/farmbot-rpi-11.0.1.fw"
          string :browser_download_url
        end
      end
    end

    def validate
      no_drafts!
    end

    def execute
      assets
        .select { |asset| valid_asset?(asset) }
        .map(&:with_indifferent_access)
        .map { |asset| convert_to_farmbot_release(asset) }
    end

    private

    def convert_to_farmbot_release(asset)
      platform = asset.fetch(:name).gsub("farmbot-", "").split("-").first
      unless Release::PLATFORMS.include?(platform)
        raise "Invalid platform?: #{platform}"
      end
      ({
        image_url: asset.fetch(:browser_download_url),
        version: tag_name.downcase.delete_prefix("v"),
        platform: platform,
      })
    end

    def valid_asset?(asset)
      asset[:name].start_with?(PREFIX) &&
        asset[:name].end_with?(SUFFIX) &&
        (asset[:content_type] == CONTENT_TYPE) &&
        (asset[:state] == STATE)
    end

    def no_drafts!
      if draft
        add_error :draft, :no_drafts, "Don't publish drafts."
      end
    end
  end
end
