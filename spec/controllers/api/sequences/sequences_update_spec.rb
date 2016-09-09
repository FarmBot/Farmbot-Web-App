require 'spec_helper'

describe Api::SequencesController do

  include Devise::Test::ControllerHelpers

  describe '#update' do

    let(:user) { FactoryGirl.create(:user) }
    it 'updates existing sequences' do
      sign_in user
      sequence = FactoryGirl.create(:sequence, device: user.device)
      input = { id: sequence.id,
                sequence: { name: "Scare Birds",
                            steps: [{ message_type: 'move_relative',
                            command: { action: 'MOVE RELATIVE',
                                       x: 1,
                                       y: 2,
                                       z: 3,
                                       speed: 100,
                                       delay: 0} }] } }
      patch :update, input, {format: :json}
      expect(response.status).to eq(200)
      sequence.reload
      expect(sequence.name).to eq(input[:sequence][:name])
    end
  end
end
