require 'spec_helper'

describe Api::StepsController do

  include Devise::Test::ControllerHelpers

  describe '#index' do
    let(:user) { FactoryGirl.create(:user) }
    let(:sequence) { FactoryGirl.create(:sequence, device: user.device) }

    it 'retrieves all steps for a sequence' do
      sign_in user
      get :index, sequence_id: sequence.id
      expect(response.status).to eq(200)
      expect(json[0][:id]).to eq(sequence.steps[0].id)
    end
  end
end
