require "spec_helper"

describe Device do
  let(:device) { FactoryBot.create(:device, users: [FactoryBot.create(:user)]) }
  let(:user) { device.users.first }
  # [timezone, local_ota_hour, expected]
  conversions = [
    # DST-free Timezones for easy testing:
    ["Africa/Addis_Ababa", 6, 3],
    ["Africa/Kampala", 22, 19],
    ["Africa/Lagos", 15, 14],
    ["Asia/Makassar", 2, 18],
    ["Asia/Omsk", 11, 5],
    ["Asia/Qatar", 0, 21],
    ["Asia/Seoul", 18, 9],
    ["Australia/Perth", 21, 13],
    ["Etc/GMT+4", 20, 0],
  ]

  it "converts legacy ota_hour to ota_hour_utc" do
    conversions.map do |(timezone, local_ota_hour, expected)|
      actual = Device.get_utc_ota_hour(timezone, local_ota_hour)
      expect(actual).to eq(expected)
    end
  end

  it "performs gradual upgrades of ota_hour => ota_hour_utc" do
    d = Device.new(timezone: "US/Arizona", ota_hour: 4)
    expect(d.ota_hour_utc).to eq(nil)
    d.validate
    expect(d.ota_hour_utc).to eq(11)
  end

  it "creates a token" do
    jwt = device.help_customer
    expect(jwt).to be_kind_of(String)
  end

  it "is associated with a user" do
    expect(device.users.first).to be_kind_of(User)
    expect(user.device).to be_kind_of(Device)
  end

  it "destroys dependent devices" do
    bot_id = device.id
    user_id = user.id
    user.destroy
    user_results = User.where(id: user_id).first
    bot_results = Device.where(id: bot_id).first
    expect(bot_results).to be_nil
    expect(user_results).to be_nil
  end

  it "calculates TZ offset in hours" do
    device.timezone = nil
    expect(device.tz_offset_hrs).to be 0
    device.timezone = "America/Chicago"
    expect([-5, -6, -7]).to include device.tz_offset_hrs # Remember DST!
  end

  it "sends specific users toast messages" do
    Transport.current.clear!
    hello = "Hello!"
    log = device.tell(hello)
    json, info = Transport.current.connection.calls[:publish].last
    json = JSON.parse(json)
    expect(info[:routing_key]).to eq("bot.device_#{device.id}.logs")
    expect(log.message).to eq(hello)
    expect(json["message"]).to eq(hello)
  end

  it "unthrottles a runaway device" do
    expect(device).to receive(:tell).and_return(Log.new)
    example = Time.now - 1.minute
    device.update!(throttled_until: example)
    expect(device.throttled_until).to eq(example)
    device.maybe_unthrottle
    expect(device.throttled_until).to eq(nil)
  end

  it "is a device" do
    expect(Device.new.is_device).to eq(true)
  end

  it "keeps track of unsent _ROUTINE_ emails" do
    🤖 = FactoryBot.create(:device)
    📧 = FactoryBot.create(:log, device: 🤖, channels: ["email"])
    🚑 = FactoryBot.create(:log, device: 🤖, channels: ["fatal_email"])
    🍞 = FactoryBot.create(:log, device: 🤖, channels: ["toast"])
    results = 🤖.unsent_routine_emails
    expect(results).to include(📧)
    expect(results).to_not include(🚑)
    expect(results).to_not include(🍞)
  end

  it "throttled emails about MQTT rate limiting" do
    device.update!(mqtt_rate_limit_email_sent_at: 2.days.ago)
    Device.connection_warning("device_#{device.id.to_s}")
    time = device.reload.mqtt_rate_limit_email_sent_at
    expect(time).to be > 1.minute.ago
    Device.connection_warning("device_#{device.id.to_s}")
    time2 = device.reload.mqtt_rate_limit_email_sent_at
    expect(time).to eq(time2)
  end

  it "enforces correct OTA hours" do
    expect { device.update!(ota_hour: -1) }.to raise_error(ActiveRecord::RecordInvalid)
    expect { device.update!(ota_hour: 24) }.to raise_error(ActiveRecord::RecordInvalid)
    device.update!(ota_hour: 4)
    expect(device.ota_hour).to eq(4)
  end

  it "sends upgrade request" do
    expect(Transport.current).to receive(:amqp_send).with(Device::UPGRADE_RPC,
                                                          device.id,
                                                          "from_clients")
    device.send_upgrade_request
  end

  it "builds a DB-only subquery for excess sensor readings" do
    relation = device.excess_sensor_readings

    expect(relation.to_sql).to include("OFFSET #{Device::DEFAULT_MAX_SENSOR_READINGS}")
    expect(relation.to_sql).to include("\"sensor_readings\".\"id\" IN")
  end

  it "returns limited sensor readings in reverse chronological order" do
    const_reassign(Device, :DEFAULT_MAX_SENSOR_READINGS, 2) do
      oldest = FactoryBot.create(:sensor_reading,
                                 device: device,
                                 created_at: 2.seconds.ago,
                                 updated_at: 2.seconds.ago)
      tied_time = 1.second.ago
      older_tied = FactoryBot.create(:sensor_reading,
                                     device: device,
                                     created_at: tied_time,
                                     updated_at: tied_time)
      newer_tied = FactoryBot.create(:sensor_reading,
                                     device: device,
                                     created_at: tied_time,
                                     updated_at: tied_time)

      expect(device.limited_sensor_readings_list.pluck(:id))
        .to eq([newer_tied.id, older_tied.id])
      expect(device.limited_sensor_readings_list.pluck(:id))
        .not_to include(oldest.id)
    end
  end

  it "trims older sensor readings beyond the device limit" do
    const_reassign(Device, :DEFAULT_MAX_SENSOR_READINGS, 2) do
      oldest = FactoryBot.create(:sensor_reading,
                                 device: device,
                                 created_at: 3.seconds.ago,
                                 updated_at: 3.seconds.ago)
      middle = FactoryBot.create(:sensor_reading,
                                 device: device,
                                 created_at: 2.seconds.ago,
                                 updated_at: 2.seconds.ago)
      newest = FactoryBot.create(:sensor_reading,
                                 device: device,
                                 created_at: 1.second.ago,
                                 updated_at: 1.second.ago)

      device.trim_excess_sensor_readings

      expect(device.sensor_readings.pluck(:id)).to match_array([middle.id, newest.id])
      expect(SensorReading.exists?(oldest.id)).to be(false)
    end
  end

  it "reports unknown location in feedback payload when coordinates are missing" do
    expect(Faraday).to receive(:post) do |_url, payload, _headers|
      text = JSON.parse(payload)["text"]
      expect(text).to include("`Location`: unknown")
    end

    with_modified_env FEEDBACK_WEBHOOK_URL: "https://localhost:3000/" do
      device.update!(lat: nil, lng: nil)
      device.provide_feedback("Example message", "Example slug")
    end
  end

  it "reports mapped location in feedback payload when coordinates are present" do
    device.update!(lat: 40.7128, lng: -74.0060)

    expect(Faraday).to receive(:post) do |_url, payload, _headers|
      text = JSON.parse(payload)["text"]
      expect(text).to include("`Location`: <https://www.openstreetmap.org/?mlat=40.7128&mlon=-74.006&zoom=10|40.7128,-74.006>")
    end

    with_modified_env FEEDBACK_WEBHOOK_URL: "https://localhost:3000/" do
      device.provide_feedback("Example message", "Example slug")
    end
  end
end
