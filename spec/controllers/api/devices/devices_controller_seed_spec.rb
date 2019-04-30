require "spec_helper"

describe Api::DevicesController do
  include Devise::Test::ControllerHelpers

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  describe "#seed" do
    periph_names = [
      Devices::Seeders::Constants::ToolNames::VACUUM,
      Devices::Seeders::Constants::ToolNames::WATER,
    ].sort

    sensor_names = [
      Devices::Seeders::Constants::ToolNames::SOIL_SENSOR,
      Devices::Seeders::Constants::ToolNames::TOOL_VERIFICATION,
    ].sort

    it "seeds accounts with default data" do
      plant = FactoryBot.create(:plant)
      device = plant.device
      sign_in user
      device = user.device
      expect(device.plants.count).to eq(0)
      run_jobs_now do
        post :seed, params: { product_line: "none" }
      end
      expect(response.status).to eq(200)
      count = Devices::Seeders::Constants::PLANTS.count
      expect(device.reload.plants.count).to eq(count)
    end

    it "seeds accounts with Genesis 1.2 data" do
      plant = FactoryBot.create(:plant)
      device = plant.device
      sign_in user
      device = user.device
      expect(device.plants.count).to eq(0)
      expect(device.peripherals.count).to eq(0)
      run_jobs_now do
        post :seed, params: { product_line: "genesis_1.2" }
      end
      expect(response.status).to eq(200)

      # PERIPHERAL assertions, vacuum, water
      peripherals = device.peripherals
      expect(peripherals.count).to eq(2)
      periph_names.map { |p| expect(peripherals.pluck(:label)).to include(p) }
      expect(device.plants.count).to eq(Devices::Seeders::Constants::PLANTS.count)
      expect(device.sensors.pluck(:pin).sort).to eq([59, 63])
      expect(device.sensors.pluck(:label).sort).to eq(sensor_names)
      name = device.reload.name
      expect(name).to eq(Devices::Seeders::Constants::Names::GENESIS)
      configs = device
        .firmware_config
        .slice(:encoder_enabled_x, :encoder_enabled_y, :encoder_enabled_z)
        .values
        .sort
      expect(configs).to eq([1, 1, 1])
      expect(device.fbos_config.firmware_hardware).to eq(FbosConfig::ARDUINO)
      slot_names = device.tool_slots.pluck(:name)

      %i(SEED_BIN SEED_TRAY SEEDER SOIL_SENSOR WATERING_NOZZLE WEEDER)
        .map { |sym| Devices::Seeders::Constants::ToolNames.const_get sym }
        .map { |x| expect(slot_names).to include(x) }

      expect(device.sequences.count).to eq(7)
      binding.pry # Now what?
    end
  end
end
