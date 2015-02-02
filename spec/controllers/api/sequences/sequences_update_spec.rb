require 'spec_helper'

describe Api::SequencesController do

  include Devise::TestHelpers

  describe '#update' do

    let(:user) { FactoryGirl.create(:user) }

    it 'updates existing sequences' do
      sign_in user
      sequence = FactoryGirl.create(:sequence, user: user)
      input = { id: sequence._id.to_s,
                sequence: { name: "Scare Birds",
                            steps: [{ message_type: 'move_rel',
                            command: { action: 'MOVE RELATIVE',
                                       x: 1,
                                       y: 2,
                                       z: 3,
                                       speed: 100,
                                       delay: 0} }] } }
      patch :update, input
      expect(response.status).to eq(200)
      sequence.reload
      expect(sequence.name).to eq(input[:sequence][:name])
    end
  end
end
