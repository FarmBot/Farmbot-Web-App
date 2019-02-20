require 'spec_helper'

describe Api::SequencesController do
  before :each do
    request.headers["accept"] = 'application/json'
  end

  include Devise::Test::ControllerHelpers

  describe '#destroy' do
    let(:user) { FactoryBot.create(:user) }
    let(:device) { user.device }
    let(:sequence) { FakeSequence.create( device: device) }

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
      other_persons = FakeSequence.create()
      input = { id: other_persons.id }
      delete :destroy, params: input
      expect(response.status).to eq(404)
    end

    it 'allows deletion of recursive sequences' do
      sign_in user
      s = Sequences::Create.run!({device: user.device,
                                  name: "Rick-cursion",
                                  body: [] })
      body = {
        sequence: {
          body: [
            {
              kind: "execute",
              args: { sequence_id: s[:id] }
            }
          ]
        }
      }.to_json

      patch :update,
            params: { id: s[:id] },
            body: body,
            as: :json

      sequence.reload
      input = { id: sequence.id }
      before = Sequence.count
      delete :destroy, params: input
      after  = Sequence.count
      expect(response.status).to eq(200)
      expect(after).to be < before
      expect { Sequence.find(s[:id]) }.to(raise_error(ActiveRecord::RecordNotFound))
    end

    it 'prevents deletion of sequences that are in use by pin bindings' do
      sign_in user
      pb = PinBindings::Create.run!(device: user.device,
                                    sequence_id: sequence.id,
                                    pin_num: 10)
      delete :destroy, params: { id: sequence.id }
      expect(response.status).to eq(422)
      expect(json[:sequence]).to include("in use")
      expect(json[:sequence]).to include(pb.fancy_name)
    end

    it 'does not destroy a sequence when in use by a sequence' do
      program = [
        {
          kind: "_if",
          args: {
            lhs:"x",
            op:"is",
            rhs:0,
            _then: {
              kind: "execute",
              args: { sequence_id: sequence.id }
            },
            _else: {
              kind: "execute",
              args: { sequence_id: sequence.id }
            },
          }
        }
      ]
      Sequences::Create.run!(name:   "Dep. tracking",
                             device: user.device,
                             body:   program)
      newest = Sequence.last
      before = EdgeNode.where(kind: "sequence_id").count
      sign_in user
      delete :destroy, params: { id: sequence.id }
      after = EdgeNode.where(kind: "sequence_id").count
      expect(response.status).to eq(422)
      expect(before).to eq(after)
      expect(json[:sequence]).to include("in use")
      expect(json[:sequence]).to include("Dep. tracking")
    end
  end
end
