require 'spec_helper'

describe Api::SchedulesController do
  include Devise::Test::ControllerHelpers

  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }
    let(:sequence) { FactoryGirl.create(:sequence) }

    it 'makes a schedule' do
      sign_in user
      seq_id = sequence.id
      input = { sequence_id: seq_id,
                start_time: '2015-02-17T15:16:17.000Z',
                end_time: '2099-02-17T18:19:20.000Z',
                repeat: 4,
                time_unit: 'minutely' }
      before = Schedule.count
      post :create, input
      expect(response.status).to eq(200)
      expect(before < Schedule.count).to be_truthy
    end

    it 'handles missing schedule_id' do
      sign_in user
      input = { start_time: '2015-02-17T15:16:17.000Z',
                end_time: '2099-02-17T18:19:20.000Z',
                repeat: 4,
                time_unit: 'minutely' }
      post :create, input
      expect(response.status).to eq(422)
      expect(json[:sequence]).to include("can't be nil")
    end
  end
end
