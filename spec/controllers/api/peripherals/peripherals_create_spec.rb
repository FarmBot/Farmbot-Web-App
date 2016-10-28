require 'spec_helper'

describe Api::PeripheralsController do
  include Devise::Test::ControllerHelpers

  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }

    it 'makes a Peripheral' do
      sign_in user
      post :create, input
      before = Peripheral.count
      expect(response.status).to eq(200)
      expect(before < Peripheral.count).to be_truthy
    end

    it 'requires logged in user' do
      post :create, input
      expect(response.status).not.to eq(422)
    end
  end
end
