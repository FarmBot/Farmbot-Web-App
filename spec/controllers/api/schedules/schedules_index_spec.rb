require 'spec_helper'

describe Api::SchedulesController do
  include Devise::Test::ControllerHelpers

  describe '#index' do

    let(:user) { FactoryGirl.create(:user) }

    it 'lists all schedules for a user' do
      sign_in user
      
      schedules = FactoryGirl.create_list(:schedule, 2, device_id: user.device.id)
      schedule_ids = user.device.schedules
                       .map(&:id)
                       .sort
      process :index, method: :get
      expect(response.status).to eq(200)
      expect(json.length).to eq(2)
      expect(json.map { |s| s[:id] }.sort).to eq(schedule_ids)
    end
  end
end
