require 'spec_helper'

describe Api::FarmEventsController do
  include Devise::Test::ControllerHelpers

  describe '#index' do

    let(:user) { FactoryGirl.create(:user) }

    it 'lists all farm_events for a user' do
      sign_in user

      farm_events = FactoryGirl.create_list(:farm_event, 2, device_id: user.device.id)
      farm_event_ids = user.device.farm_events
                       .map(&:id)
                       .sort
      process :index, method: :get
      expect(response.status).to eq(200)
      expect(json.length).to eq(2)
      expect(json.map { |s| s[:id] }.sort).to eq(farm_event_ids)
    end
  end
end
