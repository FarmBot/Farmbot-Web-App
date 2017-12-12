require 'spec_helper'

describe Api::PeripheralsController do
  include Devise::Test::ControllerHelpers

  describe '#index' do

    let(:user) { FactoryBot.create(:user) }

    it 'lists all Peripherals for a user' do
      sign_in user
      user.device.peripherals.destroy_all # Prevent blinky tests.
      peripherals = FactoryBot.create_list(:peripheral, 2, device_id: user.device.id)
      expected = user
        .device
        .peripherals
        .reload
        .map(&:id)
        .sort
      process :index, method: :get
      expect(response.status).to eq(200)
      expect(json.length).to eq(2)
      actual = json.map { |s| s[:id] }.sort
      expect(actual).to eq(expected)
    end
  end
end
