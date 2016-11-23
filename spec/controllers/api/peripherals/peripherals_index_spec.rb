require 'spec_helper'

describe Api::PeripheralsController do
  include Devise::Test::ControllerHelpers

  describe '#index' do

    let(:user) { FactoryGirl.create(:user) }

    it 'lists all Peripherals for a user' do
      sign_in user

      peripherals = FactoryGirl.create_list(:peripheral, 2, device_id: user.device.id)
      peripheral_ids = user.device.peripherals
                       .map(&:id)
                       .sort
      process :index, method: :get
      expect(response.status).to eq(200)
      expect(json.length).to eq(2)
      expect(json.map { |s| s[:id] }.sort).to eq(peripheral_ids)
    end
  end
end
