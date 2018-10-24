require 'spec_helper'

describe Api::PeripheralsController do
  include Devise::Test::ControllerHelpers

  describe '#show' do

    let(:user) { FactoryBot.create(:user) }

    it 'lists a Peripheral for a user' do
      sign_in user
      user.device.peripherals.destroy_all # Prevent blinky tests.
      peripheral = FactoryBot.create(:peripheral, device_id: user.device.id)
      get :show, params: { id: peripheral.id }
      expect(response.status).to eq(200)
      expect(json[:id]).to eq(peripheral.id)
    end
  end
end
