require 'spec_helper'

describe Api::StepsController do

  include Devise::Test::ControllerHelpers

  describe '#create' do

    let(:sequence) { FactoryGirl.create(:sequence, device: user.device) }
    let(:user) { FactoryGirl.create :user }

    it 'creates a new step sequence' do
      sign_in user
      input = { sequence_id: sequence.id,
                name: 'Scare Birds',
                message_type: 'move_relative',
                command: { action: 'MOVE RELATIVE',
                           x: 1,
                           y: 2,
                           z: 3,
                           speed: 100,
                           delay: 0 } }
      before = sequence.steps.count
      post :create, input
      expect(response.status).to eq(200)
      expect(sequence.reload.steps.count).to be > before
    end
  end
end
