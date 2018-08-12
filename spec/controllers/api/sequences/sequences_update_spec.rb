require 'spec_helper'

describe Api::SequencesController do
  include Devise::Test::ControllerHelpers
  let(:nodes) { sequence_body_for(user) }

  describe '#update' do

    let(:user) { FactoryBot.create(:user) }
    it 'does not let you use other peoples point resources' do
      sign_in user
      sequence  = FakeSequence.create( device: user.device)
      not_yours = FactoryBot.create(:plant)
      expect(not_yours.device_id).to_not eq(user.device_id)
      input = {
        id: sequence.id,
        sequence: {
          name: "Wrong `locals` declaration",
          args: { locals: { kind: "scope_declaration", args: {} } },
          body: [
            {
              kind: "move_absolute",
              args: {
                location: {
                    kind: "point",
                    args: { pointer_type: "Plant", pointer_id: not_yours.id }
                  },
                  speed: 100,
                  offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
                }
              }
          ],
        }
      }
      patch :update, params: {id: sequence.id }, body: input.to_json, as: :json
      binding.pry
      expect(response.status).to eq(422)
      expect(json[:error]).to include("Not your point")
    end

    it 'doesnt allow nonsense in `sequence.args.locals`' do
      sign_in user
      sequence = FakeSequence.create( device: user.device)
      input = { id: sequence.id,
                sequence: { name: "Wrong `locals` declaration",
                            body: [],
                            args: { locals: {} } } }
      patch :update, params: {id: sequence.id }, body: input.to_json, as: :json
      expect(response.status).to eq(422)
      expect(json[:body]).to include("leaf 'locals' within 'sequence'")
      expect(json[:body]).to include("but got Hash")
    end

    it 'updates existing sequences' do
      sign_in user
      sequence = FakeSequence.create( device: user.device)
      input = { sequence: { name: "Scare Birds", args: {}, body: [] } }
      params = { id: sequence.id }
      patch :update,
        params: params,
        body: input.to_json,
        format: :json
      expect(response.status).to eq(200)
      sequence.reload
      expect(sequence.name).to eq(input[:sequence][:name])
    end
  end
end
