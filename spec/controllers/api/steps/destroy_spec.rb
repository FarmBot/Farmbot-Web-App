require 'spec_helper'

describe Api::StepsController do

  include Devise::TestHelpers

  describe '#destroy' do
    let(:sequence) do
      FactoryGirl.create(:sequence, steps: FactoryGirl.build_list(:step, 2))
    end
    let(:step) { sequence.steps[0] }
    let(:user) { sequence.user }

    it 'destroys a step sequence' do
      sign_in user
      input = { sequence_id: sequence._id.to_s,
                id: step._id.to_s }
      before = sequence.steps.count
      delete :destroy, input
      expect(response.status).to eq(200)
      expect(sequence.reload.steps.count).to be < before
    end

    it 'handles 404 for step' do
      sign_in user
      input = { sequence_id: sequence._id.to_s,
                id: '0000000000' }
      delete :destroy, input
      expect(response.status).to eq(404)
      expect(response.body).to include("Can't find Step(s)")
      expect(response.body).to include('0000000000')
    end

    it 'cannot delete other peoples steps' do
      other_guy = FactoryGirl.create(:user)
      sign_in other_guy
      input = { sequence_id: sequence._id.to_s,
                id: step._id.to_s }
      unchanged = sequence.steps.count
      delete :destroy, input
      expect(response.status).to eq(403)
      expect(sequence.reload.steps.count).to eq(unchanged)
    end
  end
end
