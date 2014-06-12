require 'spec_helper'

# Api::DevicesController is the RESTful endpoint for managing device related
# settings. Consumed by the Angular SPA on the front end.
describe Api::DevicesController do

  include Devise::TestHelpers

  describe '#index' do

    let(:user) do
      user = FactoryGirl.create(:user)
      user.devices << FactoryGirl.create(:device)
      user
    end

    it 'returns all the users devices, as JSON' do
      sign_in user
      get :index
      device = user.devices.first
      expect(response.body).to include(device._id)
      expect(response.status).to eq(200)
    end

    it 'handles requests from unauthenticated users' do
      get :index, format: :json # FIXME: Y U NO DEFAULT JSON?
      expect(response.status).to eq(401)
    end
  end
end