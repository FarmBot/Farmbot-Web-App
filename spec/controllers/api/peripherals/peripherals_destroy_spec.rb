require 'spec_helper'

describe Api::PeripheralsController do
  include Devise::Test::ControllerHelpers
  describe '#destroy' do
    let(:user) { FactoryBot.create(:user) }
    let(:peripheral) { FactoryBot.create(:peripheral, device: user.device) }

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
      peripheral = FactoryBot.create(:peripheral)
      delete :destroy, params: { id: peripheral.id }
      before = Peripheral.count
      expect(response.status).to eq(404)
      expect(before == Peripheral.count).to be_truthy
      expect(json[:error]).to include("not found")
    end
  end
end
