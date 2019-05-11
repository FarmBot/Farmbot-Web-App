require "spec_helper"

describe Api::DevicesController do
  include Devise::Test::ControllerHelpers

  describe "#destroy" do
    let(:password) { "password456" }
    let(:user) { FactoryBot.create(:user, password: password, password_confirmation: password) }

    resources = %w(sensor peripheral log pin_binding generic_pointer
                   tool_slot plant_template saved_garden sensor_reading
                   farmware_installation tool)

    it "resets a bot" do
      sign_in user
      device = user.device
      resources.map do |resource|
        FactoryBot.create(resource.to_sym, device: device)
      end

      resources.map do |resource|
        expect(device.send(resource.pluralize).reload.count).to be > 0
      end

      run_jobs_now { post :reset, params: { password: password } }

      resources.map do |resource|
        expect(device.send(resource.pluralize).reload.count).to eq 0
      end
      expect(device.alerts.count).to eq(1)
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
