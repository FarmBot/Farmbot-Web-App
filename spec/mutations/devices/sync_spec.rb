require "spec_helper"

describe Devices::Sync do
  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  TABLES = Set.new([
    :devices,
    :farm_events,
    :farmware_envs,
    :farmware_installations,
    :fbos_configs,
    :firmware_configs,
    :first_party_farmwares,
    :peripherals,
    :pin_bindings,
    :points,
    :regimens,
    :sensor_readings,
    :sensors,
    :sequences,
    :tools,
    :point_groups,
  ])

  it "is different this time!" do
    old_timestamp = 5.years.ago
    device.last_saw_api = old_timestamp
    results = Devices::Sync.run!(device: device)
    expect(Set.new(results.keys)).to eq(TABLES)
    expect(device.reload.last_saw_api).to be > old_timestamp
  end

  it "sets first_saw_api time" do
    expect(device.first_saw_api).to be(nil)
    Devices::Sync.run!(device: device)
    new_time = device.reload.first_saw_api
    expect(new_time).to be
    expect(new_time).to be_kind_of(ActiveSupport::TimeWithZone)
    Devices::Sync.run!(device: device)
    new_time2 = device.reload.first_saw_api
    expect(new_time).to eq(new_time2)
  end
end
