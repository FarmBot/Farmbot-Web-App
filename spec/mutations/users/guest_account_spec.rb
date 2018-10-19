require "spec_helper"

describe Users::GuestAccount do
  it "Creates a guest account" do
    device = Users::GuestAccount.run!
    # === Validate device
    expect(device.name).to         eq("My FarmBot")
    expect(device.timezone).to     eq("UTC")
    expect(device.fbos_version).to eq("6.4.11")
    expect(device.name).to         eq("My FarmBot")

    # === Validate farm_event
    expect(device.farm_events.length).to eq(1)
    fe   = device.farm_events.first
    diff = Time.now - fe.start_time
    expect(diff).to be < 100
    expect(fe.executable).to be_kind_of(Regimen)

    # === Validate fbos_config
    # === Validate firmware_config
    # === Validate web_app_config
    [:fbos_config, :firmware_config, :web_app_config].map do |x|
      actual   = device.send(x).as_json.symbolize_keys
      expected = Users::GuestAccount::SEED_DATA[x]
      expect(actual).to include(expected)
    end

    # === Validate images
    expect(device.images.length).to eq(1)
    img = device.images.last
    expect(img.as_json["meta"]).to eq("x" => 500.0, "y" => 500.0, "z" => 0.0)

    # === Validate logs
    msgs = device.logs.pluck(:message)
    expect(msgs.length).to eq(6)
    expect(msgs).to include("Farmbot is up and running!")

    # === Validate peripherals
    peripherals = device.peripherals
    expect(peripherals.length).to eq(5)
    labels = peripherals.pluck(:label).sort
    expect(labels[0]).to eq("Lighting")
    expect(labels[1]).to eq("Peripheral 4")
    expect(labels[2]).to eq("Peripheral 5")
    expect(labels[3]).to eq("Vacuum")
    expect(labels[4]).to eq("Water")

    # === Validate pin_bindings
    pb = device.pin_bindings
    expect(pb.count).to eq(3)
    expect(pb.pluck(:sequence_id).compact).to eq([])

    # === Validate points
    points = device.points
    expect(points.count).to eq(53) # Dunno

    # === Validate regimen
    expect(device.regimens.count).to eq(1)
    reg  = device.regimens.first
    expect(reg.name).to eq("Spinach Plant Care")

    # === Validate sensors
    sensors = device.sensors
    expect(sensors.count).to eq(2)

    # === Validate sequences
    sequences = device.sequences
    expect(sequences.count).to eq(8)

    # === Validate tools
    tools = device.tools
    expect(tools.count).to eq(6)

    # === Validate user
    user = device.users.first
    expect(user.email).to include("@farmbot.io")
    expect(user.name).to eq("FarmBot")

    # === Validate webcam_feed
    wcf = device.webcam_feeds
    expect(wcf.count).to eq(1)
    expect(wcf.first.url)
      .to eq("https://cdn.shopify.com/s/files/1/2040/0289/files/FarmBot.jpg?16907882993122390390")
  end
end
