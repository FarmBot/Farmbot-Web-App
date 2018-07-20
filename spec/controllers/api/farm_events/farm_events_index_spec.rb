require 'spec_helper'

describe Api::FarmEventsController do
  include Devise::Test::ControllerHelpers

  describe '#index' do

    let(:user) { FactoryBot.create(:user) }

    it 'lists all farm_events for a user' do
      sign_in user
      farm_events    = FactoryBot.create_list(:farm_event,
                                              2,
                                              device_id: user.device.id,
                                              end_time: 2.years.from_now)
      farm_event_ids = user.device.farm_events
                        .map(&:id)
                        .sort
      process :index, method: :get
      expect(response.status).to eq(200)
      expect(json.length).to eq(2)
      expect(json.map { |s| s[:id] }.sort).to eq(farm_event_ids)
    end

    it 'cleans up old farm events' do
      sign_in user
      farm_events = FactoryBot.create_list(:farm_event,
                                            2,
                                            device_id: user.device.id,
                                            end_time:  Date.yesterday - 1.day)
      start_count = FarmEvent.count
      process :index, method: :get
      end_count = FarmEvent.count
      expect(start_count).to be > end_count
    end
  end
end
