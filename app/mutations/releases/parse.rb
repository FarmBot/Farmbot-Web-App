# FIND EXAMPLE JSON:
# curl -s https://api.github.com/repos/farmbot/farmbot_os/releases/latest
module Releases
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
      assets.select do |asset|
        asset[:name].start_with?(PREFIX) &&
        asset[:name].end_with?(SUFFIX) &&
        (asset[:content_type] == CONTENT_TYPE) &&
        (asset[:state] == STATE)
      end.map do |asset|
        channel = prerelease ? "beta" : "stable"
        platform = asset.fetch(:name).scan(/^farmbot-.*-/).first.split("-").last
        unless Release::PLATFORMS.include?(platform)
          raise "Invalid platform?"
        end
        ({
          image_url: asset.fetch(:browser_download_url),
          version: tag_name,
          platform: platform,
          channel: channel,
        })
      end
    end

    private

    def no_drafts!
      if draft
        add_error :draft, :no_derafts, "Don't publish drafts."
      end
    end
  end
end
