require 'spec_helper'

describe Api::SequencesController do
  before :each do
    request.headers["accept"] = 'application/json'
  end

  include Devise::Test::ControllerHelpers

  describe '#destroy' do
    let(:user) { FactoryGirl.create(:user) }
    let(:device) { user.device }
    let(:sequence) { FactoryGirl.create(:sequence, device: device) }

    it 'destroys a sequence' do
      sign_in user
      input = { id: sequence.id }
      delete :destroy, params: input
      expect(response.status).to eq(200)
      expect { sequence.reload }
        .to(raise_error(ActiveRecord::RecordNotFound))
    end

    it 'doesnt destroy other peoples sequence' do
      sign_in user
      other_dudes = FactoryGirl.create(:sequence)
      input = { id: other_dudes.id }
      delete :destroy, params: input
      expect(response.status).to eq(403)
    end


    it 'does not destroy a sequence when in use by a sequence' do
      before = SequenceDependency.count
      program = [
        {
          kind: "_if",
          args: {
            lhs:"x",
            op:"is",
            rhs:0,
            _then: {
              kind: "execute",
              args: {
                sequence_id: sequence.id
              }
            },
            _else: {
              kind: "execute",
              args: {
                sequence_id: sequence.id
              }
            },
          }
        }
      ]
      Sequences::Create.run!(name:   "Dep. tracking",
                             device: user.device,
                             body:   program)
      expect(SequenceDependency.count).to be > before
      sd = SequenceDependency.last
      newest = Sequence.last
      expect(sd.dependency).to eq(sequence)
      expect(sd.sequence).to eq(newest)

      sign_in user
      before = Sequence.count
      delete :destroy, params: { id: sequence.id }
      after = Sequence.count
      expect(response.status).to eq(422)
      expect(before).to eq(after)
      expect(json[:sequence]).to include("sequences are still relying on this sequence")
    end
  end
end
