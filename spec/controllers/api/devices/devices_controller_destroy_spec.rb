require "spec_helper"

describe Api::DevicesController do
  include Devise::Test::ControllerHelpers

  describe "#destroy" do
    let(:password) { "password456" }
    let(:user) { FactoryBot.create(:user, password: password, password_confirmation: password) }

    resources = %w(sensor peripheral log pin_binding generic_pointer
                   tool_slot plant_template saved_garden sensor_reading
                   farmware_installation tool token_issuance)

    it "resets a bot" do
      sign_in user
      device = user.device
      resources.map do |resource|
        FactoryBot.create(resource.to_sym, device: device)
      end

      resources.map do |resource|
        expect(device.send(resource.pluralize).reload.count).to be > 0
      end

      device.update_attributes(name: "#{SecureRandom.hex(10)}")

      run_jobs_now { post :reset, params: { password: password } }

      resources
        .without("token_issuance")
        .map do |resource|
        count = device.send(resource.pluralize).reload.count
        if count > 0
          did_not_delete = "Epected #{resource} count to be 0 but got #{count}"
          fail(did_not_delete)
        end
      end
      expect(device.reload.name).to eq("FarmBot")
      expect(device.alerts.count).to eq(1)
      expect(device.token_issuances.count).to_not be > 1
    end

    it "can't reset a device if credentials are missing" do
      sign_in user
      device = user.device

      run_jobs_now { post :reset, params: {} }
      expect(response.status).to eq(422)
      expect(json.fetch(:password)).to eq("Password is required")
    end

    it "destroys a Device" do
      sign_in user
      old_bot = user.device
      delete :destroy, params: { id: user.device.id }
      user.reload
      expect(user.device.id).not_to eq(old_bot.id)
      expect(response.status).to eq(204)
    end
  end
end
