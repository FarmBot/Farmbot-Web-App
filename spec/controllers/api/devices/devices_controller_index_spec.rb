require 'spec_helper'

describe Api::DevicesController do

  include Devise::Test::ControllerHelpers

  describe '#show' do

    let(:user) { FactoryBot.create(:user) }

    it 'returns all the users devices, as JSON' do
      sign_in user
      get :show, format: :json
      device = user.device
      id = JSON.parse(response.body)["id"]
      expect(Device.find(id)).to eq(device)
      expect(response.status).to eq(200)
    end

    it 'handles requests from unauthenticated users' do
      get :show, format: :json # FIXME: Y U NO DEFAULT JSON?
      expect(response.status).to eq(401)
    end
  end
end
