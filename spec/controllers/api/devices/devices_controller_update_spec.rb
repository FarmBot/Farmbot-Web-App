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

    it 'updates a Device Timezone wrong' do
      sign_in user
      before = user.device.timezone
      put :update,
          params: {id: user.device.id, timezone: "NO!"},
          session: { format: :json }
      # put path, params, options
      user.reload
      expect(response.status).to eq(422)
      device = user.reload.device.reload
      expect(json[:error]).to include("not a valid timezone")
      expect(user.device.timezone).to eq(before)
    end

    it 'updates a Device timezone correctly' do
      sign_in user
      fake_tz = Device::TIMEZONES.sample
      put :update, params: {id: user.device.id, timezone: fake_tz}, session: { format: :json }
      user.reload
      device = user.reload.device.reload
      expect(device.timezone).to eq(fake_tz)
      expect(response.status).to eq(200)
    end
  end
end
