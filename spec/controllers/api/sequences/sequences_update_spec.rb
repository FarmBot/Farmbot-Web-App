require 'spec_helper'

describe Api::SequencesController do

  include Devise::Test::ControllerHelpers
  let(:nodes) { sequence_body_for(user) }

  describe '#update' do

    let(:user) { FactoryGirl.create(:user) }

    it 'refreshes sequence dependencies on update' do
      SequenceDependency.destroy_all
      old_count = SequenceDependency.count
      sign_in user
      sequence = FactoryGirl.create(:sequence, device: user.device)
      input = {
                id: sequence.id,
                sequence: {
                  name: "Scare Birds",
                  body: nodes,
                },
                format: :json
              }
      patch :update, input
      expect(response.status).to eq(200)
      new_count = SequenceDependency.count
      expect(old_count < new_count).to be(true)
    end

    it 'updates existing sequences' do
      sign_in user
      sequence = FactoryGirl.create(:sequence, device: user.device)
      input = { id: sequence.id,
                sequence: {
                  name: "Scare Birds"
                }
              }
                                       
      patch :update, input, {format: :json}
      expect(response.status).to eq(200)
      sequence.reload
      expect(sequence.name).to eq(input[:sequence][:name])
    end
  end
end
