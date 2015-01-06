require 'spec_helper'

describe Api::SequencesController do

  include Devise::TestHelpers

  describe '#create' do

    let(:user) { FactoryGirl.create(:user) }

    it 'creates a new sequences for a user' do
      sign_in user
      inputs = {name: "Scare Birds",
                steps: [{
                    message_type: 'move_rel'
                  }]}
      post :create, inputs
      expect(response.status).to eq(200)
    end
  end
end
