require 'spec_helper'

describe Api::PeripheralsController do
  include Devise::Test::ControllerHelpers
  describe '#destroy' do
    let(:user) { FactoryGirl.create(:user) }
    let(:peripheral) { FactoryGirl.create(:peripheral, device: user.device) }
  
    it 'deletes a Peripheral' do
      sign_in user
      peripheral
      before = Peripheral.count
      delete :destroy, params: { id: peripheral.id }
      expect(response.status).to eq(200)
      expect(before > Peripheral.count).to be_truthy
    end

    it 'prevents unauthorized deletion' do
      sign_in user
      peripheral = FactoryGirl.create(:peripheral)
      delete :destroy, params: { id: peripheral.id }
      before = Peripheral.count
      expect(response.status).to eq(403)
      expect(before == Peripheral.count).to be_truthy
      expect(json[:error]).to include("Not your Peripheral.")
    end
  end
end
