require 'spec_helper'

describe Api::DevicesController do

  include Devise::Test::ControllerHelpers

  describe '#create' do

    let(:user) { FactoryGirl.create(:user) }
    let(:user2) { FactoryGirl.create(:user) }

    it 'creates a new device for a user' do
      sign_in user
      params     = {user_id: user.id, name: 'Frank', uuid: '123', token: '321'}
      post :create, params
      resp       = JSON.parse(response.body)
      new_device = Device.find(resp['_id'])
      user.reload
      expect(user.device).to eq(new_device)
      expect(response.status).to eq(200)
    end

    it 'shares devices between two users' do
      bot = user.device
      sign_in user2
      params = {name: 'Frank', uuid: bot.uuid, token: bot.token}
      post :create, params
      user.reload
      user2.reload
      expect(user.device._id).to eq(user2.device._id)
    end
  end
end
