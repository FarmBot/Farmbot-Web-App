require "spec_helper"

describe Devices::UnattendedUpgrade do
  it "specifies eligible devices" do
    destroy_everything!
    ["1.0.0", "1.0.1"].map do |version|
      ["stable", "beta"].map do |channel|
        ["rpi", "rpi3"].map do |platform|
          Release.create!(image_url: "http://farm.bot/fw.fw",
                          version: version,
                          platform: platform,
                          channel: channel)
        end
      end
    end

    expect(Device.count).to eq(0)

    devices = (1..5).to_a.map do |t|
      dev = FactoryBot.create(:device)
      dev.update!(fbos_version: "1.0.0")
      dev.fbos_config.update!(update_channel: "stable",
                              os_auto_update: true)
      dev
    end

    # Ineligible: Different channel.
    devices[0].fbos_config.update!(update_channel: "beta")

    # Ineligible: Already on latest version.
    devices[1].update!(fbos_version: "1.0.1")

    # Ineligible: OS Auto Update disabled.
    devices[2].fbos_config.update!(os_auto_update: false)

    # The remianing two devices are eligible.

    expect(Device.count).to eq(5)
    ua = Devices::UnattendedUpgrade.new
    latest = ua.latest_version("stable")
    expect(latest).to eq("1.0.1")
    devices = ua.eligible_devices("stable")
    expect(devices.count).to eq(2)
  end
end
