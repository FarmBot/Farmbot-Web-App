require "spec_helper"

describe Devices::UnattendedUpgrade do
  def create_example_releases
    ["1.0.0", "1.0.1"].map do |version|
      ["stable", "beta"].map do |channel|
        ["rpi", "rpi3"].map do |platform|
          yield({ fbos_version: version, update_channel: channel }) if block_given?
          Release.create!(image_url: "http://farm.bot/fw.fw",
                          version: version,
                          platform: platform,
                          channel: channel)
        end
      end
    end
  end

  it "specifies eligible devices for all update channels" do
    create_example_releases do |params|
      ota_hour_utc = [nil, Time.now.utc.hour].sample
      device_params = params
        .slice(:fbos_version)
        .merge(ota_hour_utc: ota_hour_utc, ota_hour: nil)

      FactoryBot
        .create(:device, device_params)
        .fbos_config
        .update!(params.slice(:update_channel))
    end
    ua = Devices::UnattendedUpgrade.new
    devices = ua.all_eligible_devices
    expect(devices.map(&:fbos_version).uniq).to eq(["1.0.0"])
    all_channels = devices.map { |d| d.fbos_config.update_channel }.sort.uniq
    expect(all_channels).to eq(["beta", "stable"])
  end

  it "specifies eligible devices on a single update channel" do
    destroy_everything!
    create_example_releases

    expect(Device.count).to eq(0)
    utc_time = Time.now.utc.hour
    devices = (1..5).to_a.map do |t|
      raise "Perfect timing error" if utc_time != Time.now.utc.hour
      dev = FactoryBot.create(:device,
                              fbos_version: "1.0.0",
                              ota_hour: nil,
                              ota_hour_utc: t.even? ? utc_time : nil)
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
    eligible_devices = ua.eligible_devices("stable")
    raise "Perfect timing error" if utc_time != Time.now.utc.hour
    if eligible_devices.count != 2
      Device
        .includes(:fbos_config)
        .order(id: :asc)
        .all
        .pluck(:id, "fbos_configs.update_channel", :fbos_version, "fbos_configs.os_auto_update", :ota_hour_utc)
        .map do |(id, uc, version, os_auto_update, ota_hour_utc)|
        hr = Time.now.utc.hour
        next "#{id} already up to date" if version == "1.0.1"
        next "#{id} is not in stable" if uc != "stable"
        next "#{id} opted out of auto update" unless os_auto_update
        next "#{id} OTA update hour is #{ota_hour_utc}, not #{hr}" if ota_hour_utc != hr
        "#{id} is OK??"
      end.map { |s| puts s }
      binding.pry
    end
    expect(eligible_devices.count).to eq(2)
  end
end
