require 'spec_helper'

describe Api::DevicesController do

  include Devise::TestHelpers

  describe '#create' do

    let(:user) { FactoryGirl.create(:user) }

    it 'creates a new device for a user' do
      sign_in user
      params     = {user_id: user.id, name: 'Frank', uuid: '123', token: '321'}
      post :create, params
      resp       = JSON.parse(response.body)
      new_device = Device.find(resp['_id'])
      expect(user.device).to eq(new_device)
      expect(response.status).to eq(200)
    end
  end
end
