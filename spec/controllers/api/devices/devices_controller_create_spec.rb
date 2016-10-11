require 'spec_helper'

describe Api::DevicesController do

  include Devise::Test::ControllerHelpers

  describe '#create' do

    let!(:user) { FactoryGirl.create(:user) }
    let!(:user2) { FactoryGirl.create(:user) }

    it 'creates a new device for a user' do
      sign_in user
      params     = { user_id: user.id, name: Haikunator.haikunate(1000) }
      post :create, params
      expect(response.status).to eq(200)
      resp       = JSON.parse(response.body)
      new_device = Device.find(resp['id'])
      user.reload
      expect(user.device).to eq(new_device)
      expect(response.status).to eq(200)
    end
  end
end
