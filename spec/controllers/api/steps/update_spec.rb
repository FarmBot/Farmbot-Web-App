require 'spec_helper'

describe Api::StepsController do

  include Devise::TestHelpers

  describe '#update' do
    let(:sequence) { FactoryGirl.create(:sequence) }
    let(:step) { sequence.steps[0] }
    let(:user) { sequence.user }

    it 'updates a step' do
      sign_in user
      params = { id: step._id.to_s,
                 sequence_id: sequence._id.to_s,
                 message_type: 'read_status' }
      patch :update, params
      expect(response.status).to eq(200)
      expect(step.reload.message_type).to eq('read_status')
    end
  end
end
