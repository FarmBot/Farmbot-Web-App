module Releases
  class Calculate < Mutations::Command
    UP_TO_DATE = "Already on the latest version."

    required do
      model :device, class: Device
      string :platform, in: Release::PLATFORMS
    end

    def validate
      if release.version == device_version
        add_error :version, :uptodate, UP_TO_DATE
      else
        device.update!(last_ota_attempt_at: Time.now)
      end
    end

    def execute
      release
    end

    def query
      inputs
        .except(:device)
        .merge(channel: device.fbos_config.update_channel || "stable")
    end

    def release
      @release ||= Release.order(created_at: :desc).find_by!(query)
    end

    # current_device.fbos_version follows this format:
    #     10.1.0.pre.RC1 10.1.2
    #
    # release.version follows this format:
    #     11.0.2-rc2 12.0.0-rc4
    #
    # This method helps unify the two formats for easier comparison.
    def device_version
      @device_version ||= (device.reload.fbos_version || "")
                                 .downcase
                                 .gsub(".pre.", "-")
    end
  end
end
