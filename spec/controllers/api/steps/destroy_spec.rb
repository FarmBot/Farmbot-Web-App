require 'spec_helper'

describe Api::StepsController do

  include Devise::Test::ControllerHelpers

  describe '#destroy' do
    let(:user) { FactoryGirl.create(:user) }
    let(:sequence) do
      FactoryGirl.create(:sequence,
                         steps: FactoryGirl.build_list(:step, 2),
                         device: user.device)
    end
    let(:step) { sequence.steps[0] }

    it 'destroys a step sequence' do
      sign_in user
      input = { sequence_id: sequence.id,
                id: step.id }
      before = sequence.steps.count
      delete :destroy, input
      expect(response.status).to eq(200)
      expect(sequence.reload.steps.count).to be < before
    end

    it 'handles 404 for step' do
      sign_in user
      input = { sequence_id: sequence.id,
                id: '0000000000' }
      delete :destroy, input
      expect(response.status).to eq(404)
      expect(response.body).to include("Document not found.")
    end

    it 'cannot delete other peoples steps' do
      other_guy = FactoryGirl.create(:user)
      sign_in other_guy
      input = { sequence_id: sequence.id,
                id: step.id }
      unchanged = sequence.steps.count
      delete :destroy, input
      expect(response.status).to eq(403)
      expect(sequence.reload.steps.count).to eq(unchanged)
    end
  end
end
