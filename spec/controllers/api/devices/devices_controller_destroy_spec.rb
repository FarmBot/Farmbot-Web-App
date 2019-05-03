require "spec_helper"

describe Api::DevicesController do
  include Devise::Test::ControllerHelpers

  describe "#destroy" do
    let(:user) { FactoryBot.create(:user) }

    resources = %w(alert sensor peripheral log pin_binding generic_pointer
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

      run_jobs_now { post :reset, params: {} }

      resources.map do |resource|
        count = device.send(resource.pluralize).reload.count
        if count == 0
          expect(count).to eq 0
        else
          binding.pry
        end
      end
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
