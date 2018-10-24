require 'spec_helper'

describe Api::FarmEventsController do
  include Devise::Test::ControllerHelpers

  describe '#show' do

    let(:user) { FactoryBot.create(:user) }

    it 'shows particular farm_event for a user' do
      sign_in user
      farm_event = FactoryBot.create(:farm_event,
                                     device_id: user.device.id,
                                     end_time: 2.years.from_now)
      get :show, params: {id: farm_event.id}
      expect(response.status).to eq(200)
      expect(json[:id]).to eq(farm_event.id)
    end
  end
end
