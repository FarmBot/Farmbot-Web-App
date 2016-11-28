require 'spec_helper'

# Api::DevicesController is the RESTful endpoint for managing device related
# settings. Consumed by the Angular SPA on the front end.
describe Api::DevicesController do

  include Devise::Test::ControllerHelpers

  describe '#update' do

    let(:user) { FactoryGirl.create(:user) }
    let(:user2) { FactoryGirl.create(:user) }

    it 'updates a Device' do
      sign_in user
      fake_name = Faker::Name.name
      put :update, params: {id: user.device.id, name: fake_name}, session: { format: :json }
      # put path, params, options
      user.reload
      device = user.reload.device.reload
      expect(device.name).to eq(fake_name)
      expect(response.status).to eq(200)
    end
  end
end
