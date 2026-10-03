module Devices
  class CreateSeedData < Mutations::Command
    STRESS_DEMO_ONLY =
      "Stress product lines are only available for demo accounts."
    STRESS_PRODUCT_LINES =
      Devices::Seeders::StressData::PRODUCT_LINES
        .transform_values { Devices::Seeders::GenesisXlOneEight }

    PRODUCT_LINES = {
      "express_1.0" => Devices::Seeders::ExpressOneZero,
      "express_1.1" => Devices::Seeders::ExpressOneOne,
      "express_1.2" => Devices::Seeders::ExpressOneTwo,
      "express_xl_1.0" => Devices::Seeders::ExpressXlOneZero,
      "express_xl_1.1" => Devices::Seeders::ExpressXlOneOne,
      "express_xl_1.2" => Devices::Seeders::ExpressXlOneTwo,

      "genesis_1.2" => Devices::Seeders::GenesisOneTwo,
      "genesis_1.3" => Devices::Seeders::GenesisOneThree,
      "genesis_1.4" => Devices::Seeders::GenesisOneFour,
      "genesis_1.5" => Devices::Seeders::GenesisOneFive,
      "genesis_1.6" => Devices::Seeders::GenesisOneSix,
      "genesis_1.7" => Devices::Seeders::GenesisOneSeven,
      "genesis_1.8" => Devices::Seeders::GenesisOneEight,
      "genesis_1.9" => Devices::Seeders::GenesisOneNine,
      "genesis_xl_1.4" => Devices::Seeders::GenesisXlOneFour,
      "genesis_xl_1.5" => Devices::Seeders::GenesisXlOneFive,
      "genesis_xl_1.6" => Devices::Seeders::GenesisXlOneSix,
      "genesis_xl_1.7" => Devices::Seeders::GenesisXlOneSeven,
      "genesis_xl_1.8" => Devices::Seeders::GenesisXlOneEight,
      "genesis_xl_1.9" => Devices::Seeders::GenesisXlOneNine,

      "none" => Devices::Seeders::None,
    }.merge(STRESS_PRODUCT_LINES)

    required do
      model :device
      string :product_line, in: PRODUCT_LINES.keys
    end

    optional do
      boolean :demo
      boolean :force_fallback_install, default: false
    end

    def validate
      if Devices::Seeders::StressData.stress?(product_line) && !demo
        add_error(:product_line, :demo_only, STRESS_DEMO_ONLY)
      end
    end

    def execute
      if device.account_seeded_at
        return { done: "Device already has seed data." }
      end

      device.update(account_seeded_at: Time.now)
      schedule_seeds!
      { done: "Loading resources now." }
    end

    def seeder
      @seeder ||= PRODUCT_LINES.fetch(product_line).new(
        device, force_fallback_install: force_fallback_install)
    end

    def run_seeds!
      seed_step = :select_seeder
      Rails.logger.info(
        "SEED DATA STARTED: device_id=#{device.id} product_line=#{product_line} " \
        "seeder=#{seeder.class.name}")
      Device.transaction do
        if demo
          seed_step = :demo_setup
          Devices::Seeders::DemoAccountSeeder.new(device).before_product_line_seeder(product_line)
        end

        seeder.class::COMMAND_ORDER.map do |cmd|
          seed_step = cmd
          seeder.send(cmd)
        end

        if demo
          seed_step = :demo_resources
          Devices::Seeders::DemoAccountSeeder.new(device).after_product_line_seeder(product_line)
        end
      end
      Rails.logger.info(
        "SEED DATA COMPLETED: device_id=#{device.id} product_line=#{product_line} " \
        "seeder=#{seeder.class.name}")
    rescue StandardError => error
      device.update!(account_seeded_at: nil)
      Rails.logger.error(
        "SEED DATA FAILED: device_id=#{device.id} product_line=#{product_line} " \
        "step=#{seed_step} error=#{error.class}; " \
        "transaction rolled back and account_seeded_at cleared.")
      device.tell("Seed data failed to load. Please try again.", ["toast"], "error").save!
      raise
    end

    protected

    def schedule_seeds!
      self.delay.run_seeds!
    end
  end
end
