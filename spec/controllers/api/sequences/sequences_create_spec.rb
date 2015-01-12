require 'spec_helper'

describe Api::SequencesController do

  include Devise::TestHelpers

  describe '#create' do

    let(:user) { FactoryGirl.create(:user) }

    it 'creates a new sequences for a user' do
      sign_in user
      input = { name: "Scare Birds",
                steps: [{ message_type: 'move_rel',
                          command: { action: 'MOVE RELATIVE',
                                     x: 1,
                                     y: 2,
                                     z: 3,
                                     speed: 100,
                                     delay: 0} }] }
      post :create, input
      expect(response.status).to eq(200)
    end
  end
end
