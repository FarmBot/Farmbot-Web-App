module Devices
  class CreateSeedData < Mutations::Command
    PRODUCT_LINES = {
      "express_1.0" => Device::Seeders::ExpressOneZero,
      "genesis_1.2" => Device::Seeders::GenesisOneTwo,
      "genesis_1.3" => Device::Seeders::GenesisOneThree,
      "genesis_1.4" => Device::Seeders::GenesisOneFour,
      "xl_1.0" => Device::Seeders::XlOneZero,
      "xl_1.4" => Device::Seeders::XlOneFour,
      "none" => Device::Seeders::None,
    }

    required do
      model :device
      string :product_line, in: PRODUCT_LINES.keys
    end

    def execute
      add_plants
    end

    def run_seeds!
      seeder = PRODUCT_LINES.fetch(product_line).new(device)
    end
  end
end
