require 'spec_helper'

describe Api::SchedulesController do
  include Devise::TestHelpers

  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }
    it 'makes a schedule' do
      sign_in user
      seq_id = FactoryGirl.create(:sequence)._id.to_s
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
  end
end
