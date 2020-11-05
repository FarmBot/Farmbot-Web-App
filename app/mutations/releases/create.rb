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
      release.update!(image_url: maybe_transload(image_url),
                      dot_img_url: maybe_transload(dot_img_url))
    end

    # NOTE: FarmBot, Inc. currently follows a naming
    # convention when transferring file assets from Github.
    # There is an expectation that the URL to the *.fw and *.img
    # files on Github are identical, excluding the file extension.
    # Example of acceptable URLs:
    # https://github.com/FarmBot/farmbot_os/releases/farmbot-rpi3-1.2.3.fw
    # https://github.com/FarmBot/farmbot_os/releases/farmbot-rpi3-1.2.3.img
    # If the URL convention changes, this method must be updated.
    # -RC 5 NOV 2020
    def dot_img_url
      @dot_img_url ||= image_url.sub(/\.fw\z/, ".img")
    end

    def maybe_transload(url)
      ENV["GCS_BUCKET"] ? Release.transload(url) : url
    end
  end
end
