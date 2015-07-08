require 'spec_helper'

describe Api::StepsController do

  include Devise::TestHelpers

  describe '#index' do
    let(:user) { FactoryGirl.create(:user) }
    let(:sequence) { FactoryGirl.create(:sequence, device: user.device) }

    it 'retrieves all steps for a sequence' do
      sign_in user
      get :index, sequence_id: sequence._id.to_s
      expect(response.status).to eq(200)
      expect(json[0][:_id]).to eq(sequence.steps[0]._id.to_s)
    end
  end
end
