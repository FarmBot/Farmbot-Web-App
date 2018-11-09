require 'spec_helper'

describe Api::DevicesController do

  include Devise::Test::ControllerHelpers

  describe '#create' do

    let!(:user) { FactoryBot.create(:user) }
    let!(:user2) { FactoryBot.create(:user) }

    it 'creates a new device for a user' do
      sign_in user
      params     = { user_id: user.id, name: Faker::Food.vegetables }
      post :create, params: params
      expect(response.status).to eq(200)
      resp       = JSON.parse(response.body)
      new_device = Device.find(resp['id'])
      user.reload
      expect(user.device).to eq(new_device)
      expect(response.status).to eq(200)
    end
  end
end
