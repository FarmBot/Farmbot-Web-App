module Devices
  class CreateSeedData < Mutations::Command
    PRODUCT_LINES = {
      "express_1.0" => Devices::Seeders::ExpressOneZero,
      "express_xl_1.0" => Devices::Seeders::ExpressXlOneZero,

      "genesis_1.2" => Devices::Seeders::GenesisOneTwo,
      "genesis_1.3" => Devices::Seeders::GenesisOneThree,
      "genesis_1.4" => Devices::Seeders::GenesisOneFour,
      "genesis_xl_1.4" => Devices::Seeders::GenesisXlOneFour,

      "none" => Devices::Seeders::None,
    }

    required do
      model :device
      string :product_line, in: PRODUCT_LINES.keys
    end

    def execute
      self.delay.run_seeds!
      { done: "Loading resources now." }
    end

    def seeder
      @seeder ||= PRODUCT_LINES.fetch(product_line).new(device)
    end

    def run_seeds!
      seeder.class::COMMAND_ORDER.map do |cmd|
        seeder.send(cmd)
      end
    end
  end
end
