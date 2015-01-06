require 'spec_helper'

describe Api::DevicesController do

  include Devise::TestHelpers

  describe '#index' do

    let(:user) { FactoryGirl.create(:user) }

    it 'returns all the users devices, as JSON' do
      sign_in user
      get :index, format: :json
      device = user.devices.first
      id = JSON.parse(response.body).first["_id"]
      expect(Device.find(id)).to eq(device)
      expect(response.status).to eq(200)
    end

    it 'handles requests from unauthenticated users' do
      get :index, format: :json # FIXME: Y U NO DEFAULT JSON?
      expect(response.status).to eq(401)
    end
  end
end
