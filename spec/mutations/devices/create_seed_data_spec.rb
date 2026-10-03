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

  describe "Genesis XL settings" do
    described_class::PRODUCT_LINES.keys.grep(/^genesis_xl_/).each do |product_line|
      it "applies XL settings for #{product_line}" do
        device = FactoryBot.create(:device)
        command = described_class.new(device: device,
                                       product_line: product_line,
                                       demo: true)
        seeder = command.seeder

        seeder.settings_device_name
        seeder.settings_default_map_size_x
        seeder.settings_default_map_size_y
        seeder.settings_three_d

        expect(device.reload.name).to eq("FarmBot Genesis XL")
        config = device.web_app_config.reload
        expect(config.map_size_x).to eq(5_900)
        expect(config.map_size_y).to eq(2_730)
        expect(device.farmware_envs.find_by!(key: "3D_beamLength").value)
          .to eq("3000")
        if product_line == "genesis_xl_1.9"
          expect(device.farmware_envs.find_by!(key: "3D_zAxisLength").value)
            .to eq("800")
        end
      end
    end
  end

  it "finishes XL demo seeding before returning without queuing another job" do
    device = FactoryBot.create(:device)
    command = Devices::CreateSeedDataInline.new(
      device: device,
      product_line: "genesis_xl_1.9",
      demo: true,
      force_fallback_install: true,
    )
    expect(command).not_to receive(:delay)

    expect(command.run!).to eq(done: "Loading resources now.")

    expect(device.reload.account_seeded_at).to be_present
    expect(device.name).to eq("FarmBot Genesis XL")
    configs = WebAppConfig.where(device_id: device.id)
    expect(configs.count).to eq(1)
    config = configs.first!
    expect(config.map_size_x).to eq(5_900)
    expect(config.map_size_y).to eq(2_730)
    expect(config.discard_unsaved).to be(true)
    expect(device.farmware_envs.find_by!(key: "3D_beamLength").value)
      .to eq("3000")
    expect(device.plants.count).to be > 0
  end

  it "queues seeding for accounts outside of demos" do
    device = FactoryBot.create(:device)
    command = described_class.new(device: device, product_line: "genesis_xl_1.9")
    queued_command = double("queued command")
    expect(command).to receive(:delay).and_return(queued_command)
    expect(queued_command).to receive(:run_seeds!)
    expect(command).not_to receive(:run_seeds!)

    expect(command.execute).to eq(done: "Loading resources now.")
    expect(device.reload.account_seeded_at).to be_present
  end

  it "queues seeding for demo accounts" do
    device = FactoryBot.create(:device)
    command = described_class.new(device: device,
                                  product_line: "genesis_xl_1.9",
                                  demo: true)
    queued_command = double("queued command")
    expect(command).to receive(:delay).and_return(queued_command)
    expect(queued_command).to receive(:run_seeds!)
    expect(command).not_to receive(:run_seeds!)

    expect(command.execute).to eq(done: "Loading resources now.")
    expect(device.reload.account_seeded_at).to be_present
    expect(device.plants.count).to eq(0)
  end

  it "validates inputs before inline seeding" do
    device = FactoryBot.create(:device)
    expect_any_instance_of(Devices::CreateSeedDataInline)
      .not_to receive(:run_seeds!)

    expect do
      Devices::CreateSeedDataInline.run!(device: device,
                                        product_line: "invalid",
                                        demo: true)
    end.to raise_error(Mutations::ValidationException)

    expect(device.reload.account_seeded_at).to be_nil
  end

  it "rejects stress product lines outside of demos when seeding inline" do
    device = FactoryBot.create(:device)
    expect_any_instance_of(Devices::CreateSeedDataInline)
      .not_to receive(:run_seeds!)

    expect do
      Devices::CreateSeedDataInline.run!(
        device: device,
        product_line: "genesis_xl_1.8_stress_250",
      )
    end.to raise_error(Mutations::ValidationException, described_class::STRESS_DEMO_ONLY)

    expect(device.reload.account_seeded_at).to be_nil
  end

  it "does not seed an already seeded account inline" do
    device = FactoryBot.create(:device, account_seeded_at: Time.now)
    command = Devices::CreateSeedDataInline.new(device: device,
                                               product_line: "none",
                                               demo: true)
    expect(command).not_to receive(:delay)
    expect(command).not_to receive(:run_seeds!)

    expect(command.run!).to eq(done: "Device already has seed data.")
  end

  it "preserves XL settings through the complete demo seed job" do
    device = FactoryBot.create(:device)
    allow(Rails.logger).to receive(:info).and_call_original
    expect(Rails.logger).to receive(:info).with(
      "SEED DATA STARTED: device_id=#{device.id} product_line=genesis_xl_1.8 " \
      "seeder=Devices::Seeders::GenesisXlOneEight")
    expect(Rails.logger).to receive(:info).with(
      "SEED DATA COMPLETED: device_id=#{device.id} product_line=genesis_xl_1.8 " \
      "seeder=Devices::Seeders::GenesisXlOneEight")

    run_jobs_now do
      described_class.run!(device: device,
                           product_line: "genesis_xl_1.8",
                           demo: true,
                           force_fallback_install: true)
    end

    expect(device.reload.name).to eq("FarmBot Genesis XL")
    config = device.web_app_config.reload
    expect(config.map_size_x).to eq(5_900)
    expect(config.map_size_y).to eq(2_730)
    expect(device.farmware_envs.find_by!(key: "3D_beamLength").value)
      .to eq("3000")
    expect(device.plants.count).to be > 0
    expect(device.sequences.exists?(name: "Water all plants")).to be(true)
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

  it "rolls back seed data after a failure and allows a retry" do
    device = FactoryBot.create(:device)
    command = Devices::CreateSeedDataInline.new(device: device,
                                               product_line: "none",
                                               demo: true)
    original_safe_height = device.fbos_config.safe_height
    expect(command).not_to receive(:delay)
    allow(command.seeder).to receive(:point_groups_all_plants)
      .and_raise("seeding failed")
    expect(Rails.logger).to receive(:error).with(
      "SEED DATA FAILED: device_id=#{device.id} product_line=none " \
      "step=point_groups_all_plants error=RuntimeError; " \
      "transaction rolled back and account_seeded_at cleared.")
    expect(device).to receive(:tell).with(
      "Seed data failed to load. Please try again.", ["toast"], "error")
      .and_call_original

    expect { command.execute }.to raise_error("seeding failed")
    log = device.logs.find_by!(message: "Seed data failed to load. Please try again.")
    expect(log.type).to eq("error")
    expect(log.channels).to eq(["toast"])
    expect(device.reload.account_seeded_at).to be_nil
    expect(device.curves.count).to eq(0)
    expect(device.fbos_config.reload.safe_height).to eq(original_safe_height)

    allow(command.seeder).to receive(:point_groups_all_plants).and_return(nil)
    expect(command.execute).to eq(done: "Loading resources now.")

    expect(device.reload.account_seeded_at).to be_present
    expect(device.curves.count).to eq(2)
    expect(device.fbos_config.reload.safe_height).to eq(-150)
    expect(device.plants.count).to be > 0
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
