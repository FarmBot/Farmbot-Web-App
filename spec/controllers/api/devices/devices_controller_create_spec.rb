require 'spec_helper'

# Api::DevicesController is the RESTful endpoint for managing device related
# settings. Consumed by the Angular SPA on the front end.
describe Api::DevicesController do

  include Devise::TestHelpers

  describe '#create' do

    let(:user) { FactoryGirl.create(:user) }

    it 'returns all the users devices, as JSON' do
      sign_in user
      params = {user_id: user.id, name: 'Frank', uuid: '123', token: '321'}
      post :create, params
      device = user.devices.first
      expect(response.body).to include(device.id)
      expect(response.status).to eq(200)
    end
  end
end