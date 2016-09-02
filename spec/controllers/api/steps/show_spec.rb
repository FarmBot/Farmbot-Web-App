require 'spec_helper'

describe Api::StepsController do
  include Devise::Test::ControllerHelpers

  describe '#show' do
    let(:sequence) { FactoryGirl.create(:sequence, device: user.device) }
    let(:user) { FactoryGirl.create :user }

    it 'retrieves all steps for a sequence' do
      id = sequence.steps.first.id
      sequence_id = sequence.id
      sign_in user
      get :show, sequence_id: sequence_id, id: id
      expect(response.status).to eq(200)
      expect(json[:id]).to eq(id)
    end
  end
end
