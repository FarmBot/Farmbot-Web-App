require "spec_helper"

describe Api::DevicesController do
  include Devise::Test::ControllerHelpers

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  describe "#seed" do
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
      # Peripheral assertions, vacuum, water
      peripherals = device.peripherals
      expect(peripherals.count).to eq(2)
      [Devices::Seeders::Constants::VACUUM, Devices::Seeders::Constants::WATER]
        .map { |p| expect(peripherals.pluck(:label)).to include(p) }

      binding.pry # Now what?
    end
  end
end
