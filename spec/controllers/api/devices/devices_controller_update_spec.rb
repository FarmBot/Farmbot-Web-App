require 'spec_helper'

# Api::DevicesController is the RESTful endpoint for managing device related
# settings. Consumed by the Angular SPA on the front end.
describe Api::DevicesController do

  include Devise::TestHelpers

  describe '#update' do

    let(:user) { FactoryGirl.create(:user) }

    it 'updates a Device' do
      sign_in user
      fake_name = Faker::Name.name
      put :update, {id: user.devices.first.id, name: fake_name}, format: :json
      # put path, params, options
      user.reload
      device = user.devices.first
      expect(device.name).to eq(fake_name)
      expect(response.status).to eq(200)
    end
  end
end