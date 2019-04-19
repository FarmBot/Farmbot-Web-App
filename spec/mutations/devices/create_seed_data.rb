require "spec_helper"

describe Devices::CreateSeedData do
  it "passes `none`" do
    device = FactoryBot.create!(:device)
    previous_peripherals_count = device.peripherals.count
    previous_pin_bindings_count = device.pin_bindings.count
    previous_plants_count = device.plants.count
    previous_sensors_count = device.sensors.count
    previous_sequences_count = device.sequences.count
    previous_tool_slots_count = device.tool_slots.count
    previous_tools_count = device.tools.count
    Devices::CreateSeedData.run!(device: device, product_line: "none")
    device.reload
    expect(device.peripherals.count).to eq(previous_peripherals_count)
    expect(device.pin_bindings.count).to eq(previous_pin_bindings_count)
    expect(device.plants.count).to eq(previous_plants_count)
    expect(device.sensors.count).to eq(previous_sensors_count)
    expect(device.sequences.count).to eq(previous_sequences_count)
    expect(device.tool_slots.count).to eq(previous_tool_slots_count)
    expect(device.tools.count).to eq(previous_tools_count)
  end
end
