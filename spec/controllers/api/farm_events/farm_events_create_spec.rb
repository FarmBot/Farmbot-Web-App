require 'spec_helper'

describe Api::FarmEventsController do
  include Devise::Test::ControllerHelpers

  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }
    let(:sequence) { FactoryGirl.create(:sequence) }

    it 'makes a farm_event' do
      pending("This API endpoint is changing soon.")
      sign_in user
      seq_id = sequence.id
      input = { sequence_id: seq_id,
                start_time: '2015-02-17T15:16:17.000Z',
                end_time: '2099-02-17T18:19:20.000Z',
                repeat: 4,
                time_unit: 'minutely' }
      before = FarmEvent.count
      post :create, params: input
      expect(response.status).to eq(200)
      expect(before < FarmEvent.count).to be_truthy
    end

    it 'handles missing farm_event_id' do
      pending("API CHANGING SOON")
      sign_in user
      input = { start_time: '2015-02-17T15:16:17.000Z',
                end_time: '2099-02-17T18:19:20.000Z',
                repeat: 4,
                time_unit: 'minutely' }
      post :create, params: input
      expect(response.status).to eq(422)
      expect(json[:executable]).to include("can't be nil")
    end
  end
end
