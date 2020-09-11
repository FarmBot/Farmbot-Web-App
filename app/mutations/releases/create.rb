# Rake task "requires" this.

module Releases
  class Create < Mutations::Command
    required do
      # "https://github.com/FarmBot/farmbot_os/releases/download/v11.0.1/farmbot-rpi3-11.0.1.fw"
      string :image_url
      string :version, matches: Release::VERSION_STORAGE_FORMAT
      string :platform, in: Release::PLATFORMS
      string :channel, in: Release::CHANNEL # "stable"
    end

    def execute
      # * Should be able to run this multiple times
      # * Should not create duplicate
      release = Release.where(inputs.except(:image_url)).first_or_initialize

      process_images(release) if release.new_record?

      release
    end

    private

    # Copy the file from Github to Google Cloud Storage.
    def process_images(release)
      final_url = ENV["GCS_BUCKET"] ? Release.transload(image_url) : image_url
      release.update!(image_url: final_url)
    end
  end
end
