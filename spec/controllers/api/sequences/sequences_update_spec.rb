require 'spec_helper'

describe Api::SequencesController do
  include Devise::Test::ControllerHelpers
  let(:nodes) { sequence_body_for(user) }

  describe '#update' do

    let(:user) { FactoryBot.create(:user) }

    def try_to_add_parent(sequence)
      input = {
      id: sequence.id,
      sequence: {
          name: "no",
          args: {
            locals: {
              kind: "scope_declaration",
              args: {},
              body: [
                {
                  kind: "parameter_declaration",
                  args: {
                    label: "parent",
                    default_value: {
                      kind: "coordinate",
                      args: { x: 9, y: 9, z: 9, }
                    }
                  }
                }
              ]
            }
          },
          body: [],
        }
      }
      patch :update, params: {id: sequence.id }, body: input.to_json, as: :json
    end

    it 'allows adding `parent` to sequences used as executable' do
      sign_in user
      sequence = FakeSequence.create(device: user.device)
      farm_ev  = FactoryBot.create(:farm_event,
                                   device: user.device,
                                   executable: sequence)
      try_to_add_parent(sequence)
      expect(response.status).to eq(200)
    end


    it 'disallows adding `parent` to sequences used in a regimen' do
      sign_in user
      sequence = FakeSequence.create(device: user.device)
      regimen  = Regimens::Create.run!(device: user.device,
                                       name:   "X",
                                       color:  "red",
                                       regimen_items: [
                                         { time_offset: 10, sequence_id: sequence.id}
                                       ])
      try_to_add_parent(sequence)
      expect(response.status).to eq(422)
      err = \
        Sequences::CeleryScriptValidators::NO_REGIMENS
      expect(json[:parent]).to include(err)
    end

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
      expect(response.status).to eq(422)
      expect(json[:body]).to include("Bad point ID")
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
      sequence = FakeSequence.create(device: user.device)
      sequence.update_attributes!(updated_at: 2.days.ago)
      updated_at_before = sequence.updated_at.to_i
      input = { sequence: { name: "Scare Birds", args: {}, body: [] } }
      params = { id: sequence.id }
      run_jobs_now do
        patch :update, params: params, body: input.to_json, format: :json
      end
      expect(response.status).to eq(200)
      sequence.reload
      expect(sequence.updated_at.to_i).to be > updated_at_before
      expect(sequence.name).to eq(input[:sequence][:name])
    end
  end
end
