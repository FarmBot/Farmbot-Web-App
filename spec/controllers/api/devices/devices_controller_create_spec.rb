require 'spec_helper'

describe Api::DevicesController do

  include Devise::Test::ControllerHelpers

  describe '#create' do

    let!(:user) { FactoryGirl.create(:user) }
    let!(:user2) { FactoryGirl.create(:user) }

    it 'creates a new device for a user' do
      sign_in user
      params     = {user_id: user.id, name: 'Frank', uuid: '123'}
      post :create, params
      resp       = JSON.parse(response.body)
      new_device = Device.find(resp['id'])
      user.reload
      expect(user.device).to eq(new_device)
      expect(response.status).to eq(200)
    end

    it 'shares devices between two users' do
      bot = user.device
      sign_in user2
      params = {name: 'QQQ', uuid: bot.uuid}
      post :create, params
      expect(user.reload.device.reload.name).to eq("QQQ")
      expect(user2.reload.device.reload.name).to eq("QQQ")
      expect(user.device_id).to eq(user2.device_id)
    end
  end
end
