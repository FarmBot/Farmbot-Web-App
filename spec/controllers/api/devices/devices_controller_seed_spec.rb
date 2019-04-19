require "spec_helper"

describe Api::DevicesController do
  include Devise::Test::ControllerHelpers

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  describe "#seed" do
    it "seeds accounts with default data" do
      seed_email = Devices::Seeders::Abstract::SEED_EMAIL
      plant = FactoryBot.create(:plant)
      device = plant.device
      seed_user = FactoryBot.create(:user, device: device, email: seed_email)
      sign_in user
      device = user.device
      expect(device.plants.count).to eq(0)
      run_jobs_now do
        post :seed, params: { product_line: "none" }
      end
      expect(response.status).to eq(200)
      expect(device.reload.plants.count).to eq(seed_user.device.plants.count)
    end
  end
end
