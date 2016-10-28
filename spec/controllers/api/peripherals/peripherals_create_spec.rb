require 'spec_helper'

describe Api::PeripheralsController do
  include Devise::Test::ControllerHelpers

  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }

    it 'makes a Peripheral' do
      sign_in user
      before = Peripheral.count
      post :create, { pin: 13, mode: 0, label: "LED" }
      expect(response.status).to eq(200)
      expect(json[:pin]).to eq(13)
      expect(json[:mode]).to eq(0)
      expect(json[:label]).to eq("LED")
      expect(before < Peripheral.count).to be_truthy
    end

    it 'requires logged in user' do
      post :create, { pin: 13, mode: 0, label: "LED" }
      expect(response.status).to eq(401)
    end
  end
end
