require "spec_helper"

describe Devices::CreateSeedData do
  describe "seeder inheritance" do
    it "separates the Express and Genesis families" do
      expect(Devices::Seeders::AbstractExpress.superclass)
        .to eq(Devices::Seeders::AbstractSeeder)
    end

    it "builds Genesis seeders on the preceding version" do
      {
        Devices::Seeders::GenesisOneThree => Devices::Seeders::GenesisOneTwo,
        Devices::Seeders::GenesisOneFour => Devices::Seeders::GenesisOneThree,
        Devices::Seeders::GenesisOneFive => Devices::Seeders::GenesisOneFour,
        Devices::Seeders::GenesisOneSix => Devices::Seeders::GenesisOneFive,
        Devices::Seeders::GenesisOneSeven => Devices::Seeders::GenesisOneSix,
        Devices::Seeders::GenesisOneEight => Devices::Seeders::GenesisOneSeven,
        Devices::Seeders::GenesisOneNine => Devices::Seeders::GenesisOneEight,
      }.each do |seeder, previous_seeder|
        expect(seeder.superclass).to eq(previous_seeder)
      end
    end

    it "builds Express XL seeders on their matching Express versions" do
      {
        Devices::Seeders::ExpressXlOneZero => Devices::Seeders::ExpressOneZero,
        Devices::Seeders::ExpressXlOneOne => Devices::Seeders::ExpressOneOne,
        Devices::Seeders::ExpressXlOneTwo => Devices::Seeders::ExpressOneTwo,
      }.each do |xl_seeder, seeder|
        expect(xl_seeder.superclass).to eq(seeder)
        expect(xl_seeder.ancestors).to include(Devices::Seeders::ExpressXl)
      end
    end

    it "builds Genesis XL seeders on their matching Genesis versions" do
      {
        Devices::Seeders::GenesisXlOneFour => Devices::Seeders::GenesisOneFour,
        Devices::Seeders::GenesisXlOneFive => Devices::Seeders::GenesisOneFive,
        Devices::Seeders::GenesisXlOneSix => Devices::Seeders::GenesisOneSix,
        Devices::Seeders::GenesisXlOneSeven => Devices::Seeders::GenesisOneSeven,
        Devices::Seeders::GenesisXlOneEight => Devices::Seeders::GenesisOneEight,
        Devices::Seeders::GenesisXlOneNine => Devices::Seeders::GenesisOneNine,
      }.each do |xl_seeder, seeder|
        expect(xl_seeder.superclass).to eq(seeder)
        expect(xl_seeder.ancestors).to include(Devices::Seeders::GenesisXl)
      end
    end
  end

  it "accepts stress demo product lines" do
    expect(described_class::PRODUCT_LINES.fetch("genesis_xl_1.8_stress_250"))
      .to eq(Devices::Seeders::GenesisXlOneEight)
    expect(described_class::PRODUCT_LINES.fetch("genesis_xl_1.8_stress_1000"))
      .to eq(Devices::Seeders::GenesisXlOneEight)
  end

  it "rejects stress product lines outside of demo accounts" do
    result = described_class.run(
      device: FactoryBot.create(:device),
      product_line: "genesis_xl_1.8_stress_250",
    )

    expect(result.success?).to be(false)
    expect(result.errors.message_list)
      .to include(described_class::STRESS_DEMO_ONLY)
  end

  it "passes `none`" do
    device = FactoryBot.create(:device)
    previous_peripherals_count = device.peripherals.count
    previous_pin_bindings_count = device.pin_bindings.count
    previous_plants_count = device.plants.count
    previous_sensors_count = device.sensors.count
    previous_sequences_count = device.sequences.count
    previous_tool_slots_count = device.tool_slots.count
    previous_tools_count = device.tools.count
    run_jobs_now do
      Devices::CreateSeedData.run!(device: device, product_line: "none")
    end
    device.reload
    expect(device.peripherals.count).to eq(previous_peripherals_count)
    expect(device.pin_bindings.count).to eq(previous_pin_bindings_count)
    expect(device.plants.count).to eq(previous_plants_count)
    expect(device.sensors.count).to eq(previous_sensors_count)
    expect(device.sequences.count).to eq(previous_sequences_count)
    expect(device.tool_slots.count).to eq(previous_tool_slots_count)
    expect(device.tools.count).to eq(previous_tools_count)
  end

  it "doesn't seed twice" do
    device = FactoryBot.create(:device)
    device.account_seeded_at = Time.now
    previous_peripherals_count = device.peripherals.count
    previous_pin_bindings_count = device.pin_bindings.count
    previous_plants_count = device.plants.count
    previous_sensors_count = device.sensors.count
    previous_sequences_count = device.sequences.count
    previous_tool_slots_count = device.tool_slots.count
    previous_tools_count = device.tools.count
    run_jobs_now do
      Devices::CreateSeedData.run!(device: device, product_line: "genesis_1.2")
    end
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
