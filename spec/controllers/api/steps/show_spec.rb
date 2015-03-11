require 'spec_helper'

describe Api::StepsController do
  include Devise::TestHelpers

  describe '#show' do
    let(:sequence) { FactoryGirl.create(:sequence) }
    let(:user) { sequence.user }

    it 'retrieves all steps for a sequence' do
      id = sequence.steps.first._id.to_s
      sequence_id = sequence._id.to_s
      sign_in user
      get :show, sequence_id: sequence_id, id: id
      expect(response.status).to eq(200)
      expect(json[:_id]).to eq(id)
    end
  end
end
