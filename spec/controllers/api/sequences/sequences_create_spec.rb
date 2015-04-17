require 'spec_helper'

describe Api::SequencesController do

  include Devise::TestHelpers

  describe '#create' do

    let(:user) { FactoryGirl.create(:user) }

    it 'creates a new sequences for a user' do
      sign_in user
      input = { name: "Scare Birds",
                steps: [{ message_type: 'move_relative',
                          command: { action: 'MOVE RELATIVE',
                                     x: 1,
                                     y: 2,
                                     z: 3,
                                     speed: 100,
                                     delay: 0} }] }
      post :create, input
      expect(response.status).to eq(200)
    end

    it 'handles invalid params' do
      # Needed to test the `else` branch of mutate() somewhere
      sign_in user
      input = { steps: [{ message_type: 'move_relative',
                          command: { action: 'MOVE RELATIVE',
                                     x: 1,
                                     y: 2,
                                     z: 3,
                                     speed: 100,
                                     delay: 0} }] }
      post :create, input
      expect(response.status).to eq(422)
      expect(json[:name]).to eq("Name is required")
    end
  end
end
