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
      put :update, {id: user.device.id, name: fake_name}, format: :json
      # put path, params, options
      user.reload
      device = user.device
      expect(device.name).to eq(fake_name)
      expect(response.status).to eq(200)
    end

    it 'creates a new device if you dont have one' do
      user.update_attributes(device: nil)
      sign_in user
      fake_name = Faker::Name.name
      put :update, {}, format: :json
      user.reload
      expect(user.device).to be_kind_of(Device)
      [:uuid, :token, :name].each do |key|
        expect(user.device[key]).to eq('Not set.')
      end
    end
  end
end
