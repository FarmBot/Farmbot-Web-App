module Devices
  class CreateSeedData < Mutations::Command
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
      "genesis_xl_1.4" => Devices::Seeders::GenesisXlOneFour,
      "genesis_xl_1.5" => Devices::Seeders::GenesisXlOneFive,
      "genesis_xl_1.6" => Devices::Seeders::GenesisXlOneSix,
      "genesis_xl_1.7" => Devices::Seeders::GenesisXlOneSeven,
      "genesis_xl_1.8" => Devices::Seeders::GenesisXlOneEight,

      "none" => Devices::Seeders::None,
    }

    required do
      model :device
      string :product_line, in: PRODUCT_LINES.keys
    end

    optional do
      boolean :demo
    end

    def execute
      self.delay.run_seeds!
      { done: "Loading resources now." }
    end

    def seeder
      @seeder ||= PRODUCT_LINES.fetch(product_line).new(device)
    end

    def run_seeds!
      if demo
        Devices::Seeders::DemoAccountSeeder.new(device).before_product_line_seeder
      end

      seeder.class::COMMAND_ORDER.map do |cmd|
        seeder.send(cmd)
      end

      if demo
        Devices::Seeders::DemoAccountSeeder.new(device).after_product_line_seeder(product_line)
      end
    end
  end
end
