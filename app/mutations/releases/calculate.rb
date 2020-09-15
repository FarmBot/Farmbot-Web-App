module Releases
  class Calculate < Mutations::Command
    UP_TO_DATE = "Already on the latest version."

    required do
      model :device, class: Device
      string :platform, in: Release::PLATFORMS
    end

    # optional do
    #   string :image_url
    #   string :version, matches: Release::VERSION_STORAGE_FORMAT
    #   string :channel, in: Release::CHANNEL
    #   integer :id
    # end

    def validate
      if release.version == device_version
        add_error :version, :uptodate, UP_TO_DATE
      end
    end

    def execute
      release
    end

    def release
      @release ||= Release
        .order(created_at: :desc)
        .find_by!(inputs.except(:device))
    end

    # current_device.fbos_version follows this format:
    #     10.1.0.pre.RC1 10.1.2
    #
    # release.version follows this format:
    #     11.0.2-rc2 12.0.0-rc4
    #
    # This method helps unify the two formats for easier comparison.
    def device_version
      @device_version ||= (device.fbos_version || "")
        .downcase
        .gsub(".pre.", "-")
    end
  end
end
