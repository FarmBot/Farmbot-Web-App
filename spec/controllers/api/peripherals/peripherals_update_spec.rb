require 'spec_helper'

describe Api::PeripheralsController do
  include Devise::Test::ControllerHelpers

  describe '#update' do
    let(:user) { FactoryBot.create(:user) }

    it 'allows authorized modification' do
      sign_in user
      id = FactoryBot.create(:peripheral, device: user.device).id
      body = { pin: 9 }
      patch :update, body: body.to_json, params: { id: id, format: :json }
      expect(response.status).to eq(200)
      expect(json[:pin]).to eq(9)
      expect(Peripheral.find(id).reload.pin).to eq(9)
    end

    it 'prevents unauthorized modification' do
      sign_in user
      id = FactoryBot.create(:peripheral).id
      body = { pin: 9 }
      patch :update,
        body: body.to_json,
        params: { id: id, format: :json }
      expect(response.status).to eq(404)
      expect(json[:error]).to include('not found')
    end
  end
end
