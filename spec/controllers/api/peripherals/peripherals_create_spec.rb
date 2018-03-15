require 'spec_helper'

describe Api::PeripheralsController do
  include Devise::Test::ControllerHelpers

  describe '#create' do
    let(:user) { FactoryBot.create(:user) }

    it 'makes a Peripheral' do
      sign_in user
      before = Peripheral.count
      post :create,
        body: { pin: 13, label: "LED" }.to_json,
        params: { format: :json }
      expect(response.status).to eq(200)
      expect(json[:pin]).to eq(13)
      expect(json[:label]).to eq("LED")
      expect(before < Peripheral.count).to be_truthy
    end

    it 'requires logged in user' do
      post :create, params: { pin: 13, label: "LED" }
      expect(response.status).to eq(401)
    end

    it 'limits label length' do
      sign_in user
      before = Peripheral.count
      post :create,
        body: { pin: 13, label: ("LED" * 1000) }.to_json,
        params: { format: :json }
      expect(json[:error]).to include("use reasonable lengths")
      expect(response.status).to eq(422)
    end
  end
end
