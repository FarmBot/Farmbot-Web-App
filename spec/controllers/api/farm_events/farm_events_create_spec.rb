require 'spec_helper'

describe Api::FarmEventsController do
  include Devise::Test::ControllerHelpers

  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }
    let(:sequence) { FactoryGirl.create(:sequence) }

    it 'makes a farm_event' do
      sign_in user
      SmarfDoc.note("This is how you could create a FarmEvent that fires every"+
                    "4 minutes")
      input = { executable_id: sequence.id,
                executable_type: sequence.class.name,
                start_time: '2015-02-17T15:16:17.000Z',
                end_time: '2099-02-17T18:19:20.000Z',
                repeat: 4,
                time_unit: 'minutely' }
      before = FarmEvent.count
      post :create, params: input
      expect(response.status).to eq(200)
      expect(before < FarmEvent.count).to be_truthy
    end

    it 'handles missing farm_event id' do
      sign_in user
      input = { start_time: '2015-02-17T15:16:17.000Z',
                end_time: '2099-02-17T18:19:20.000Z',
                repeat: 4,
                time_unit: 'minutely' }
      post :create, params: input
      expect(response.status).to eq(422)
      expect(json.keys).to include(:farm_event)
    end
  end
end
