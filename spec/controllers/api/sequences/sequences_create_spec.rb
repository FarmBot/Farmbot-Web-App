require 'spec_helper'
HAS_POINTS = JSON.parse(File.read("spec/lib/celery_script/ast_has_points.json"))

describe Api::SequencesController do
  before :each do
    request.headers["accept"] = 'application/json'
  end

  include Devise::Test::ControllerHelpers

  describe '#create' do
    let(:user) { FactoryBot.create(:user) }
    let(:nodes) { sequence_body_for(user) }

    it 'handles a well formed AST in the body attribute' do
      sign_in user
      input = { name: "Scare Birds",
                body: nodes }
      sequence_body_for(user)
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(200)
      expect(json[:args]).to be_kind_of(Hash)
      expect(json[:body]).to be_kind_of(Array)
      expect(json[:body].length).to eq(nodes.length)
    end

    it 'disregards extra attrs (like `uuid`) on sequence body nodes' do
      sign_in user
      input = { name: "Scare Birds",
                body: nodes }
      input[:body].first[:uuid] = SecureRandom.uuid
      input[:body].first["uuid"] = SecureRandom.uuid
      sequence_body_for(user)
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(200)
      expect(json[:args]).to be_kind_of(Hash)
      expect(json[:body]).to be_kind_of(Array)
      expect(json[:body].length).to eq(nodes.length)
    end

    it 'creates a new sequences for a user' do
      sign_in user
      input = { name: "Scare Birds", body: [] }
      post :create, body: input.to_json, format: :json
      expect(response.status).to eq(200)
    end

    it 'handles invalid params' do
      # Needed to test the `else` branch of mutate() somewhere
      sign_in user
      input = {}
      post :create, body: input.to_json, format: :json
      expect(response.status).to eq(422)

      expect(json[:name]).to eq("Name is required")
    end

    it 'doesnt allow nonsense in `sequence.args.locals`' do
      PinBinding.destroy_all
      Sequence.destroy_all
      input = { name: "Scare Birds",
                body: [],
                # Intentional nonsense to check validation logic.
                args: { locals: { kind: "wait", args: { milliseconds: 5000 } } }
              }

      sign_in user
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(422)
      expect(Sequence.last).to_not be
      xpectd = "Expected leaf 'wait' within 'sequence' to be one of: "\
               "[\"scope_declaration\"] but got wait"
      expect(json.fetch(:body)).to eq(xpectd)
    end

    it 'strips excess `args`' do
      input = { name: "Scare Birds",
                body: [],
                # Intentional nonsense to check validation logic.
                args: { foo: "BAR" } }

      sign_in user
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(200)
      expect(json[:args][:foo]).to eq(nil)
      generated_result = CeleryScript::FetchCelery
        .run!(sequence: Sequence.find(json[:id]))
        .deep_symbolize_keys
      expect(generated_result.dig(:args, :foo)).to eq(nil)
    end

    it 'disallows bad default_values' do
      input = {
        name: "Scare Birds",
        body: [],
        # Intentional nonsense to check validation logic.
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
                    kind: "wait",
                    args: { milliseconds: 12 }
                  }
                }
              }
            ]
          }
        }
      }

      sign_in user
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(422)
      expect(json.fetch(:body)).to include('"tool"')
      expect(json[:body]).to include("Expected leaf 'wait' within "\
                                     "'parameter_declaration' to be one of: [")
    end

    it 'disallows erroneous `locals` declaration' do
      input = {
        name: "Scare Birds",
        body: [],
        # Intentional nonsense to check validation logic.
        args: {
          locals: {
            kind: "scope_declaration",
            args: {},
            body: [
              { kind: "wait", args: { milliseconds: 5000 } }
            ]
          }
        }
      }

      sign_in user
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(422)
      expctd =
        "Expected one of: [:variable_declaration, :parameter_declaration]"
      expect(json[:body]).to include(expctd)
    end

    it 'allows declaration of a variable named `parent`' do
      input = {
        name: "Scare Birds",
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
                    args: {
                      x: 0,
                      y: 0,
                      z: 0
                    }
                  }
                }
              },
              {
                kind: "variable_declaration",
                args: {
                  label: "parent2",
                  data_value: {
                    kind: "coordinate",
                    args: { x: 9, y: 9, z: 9, }
                  }
                }
              }
            ]
          }
        },
        body: [
          {
            kind: "move_absolute",
            args: {
              location: {
                kind: "identifier",
                args: { label: "parent" } },
              offset:   {
                kind: "coordinate",
                args: { x: 0, y: 0, z: 0 } },
              speed:    100,
            }
          },
          {
            kind: "move_absolute",
            args: {
              location: {
                kind: "identifier",
                args: { label: "parent2" } },
              offset:   {
                kind: "coordinate",
                args: { x: 0, y: 0, z: 0 } },
              speed:    100,
            }
          }
        ]
      }

      sign_in user
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(200)
      dig_path = [:args, :locals, :body, 0, :args, :label]
      generated_result = CeleryScript::FetchCelery
        .run!(sequence: Sequence.find(json[:id]))
        .deep_symbolize_keys
      expect(generated_result.dig(*dig_path)).to eq("parent")
      expect(json.dig(*dig_path)).to eq("parent")
    end

    it 'tracks Points' do
      point = FactoryBot.create(:generic_pointer, device: user.device)
      PinBinding.destroy_all
      Sequence.destroy_all
      EdgeNode.destroy_all
      PrimaryNode.destroy_all
      HAS_POINTS["body"][0]["args"]["location"]["args"]["pointer_id"] =
        point.id
      sign_in user
      input = { name: "Scare Birds", body: HAS_POINTS["body"] }
      sequence_body_for(user)
      before =  EdgeNode.where(kind: "pointer_id").count
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(200)
      now = EdgeNode.where(kind: "pointer_id").count
      expect(now).to be > before
    end

    it 'prevents unbound variables' do
      sign_in user
      input = {
                name: "Unbound Variable Exception",
                args: { locals: Sequence::SCOPE_DECLARATION },
                body: [
                  {
                    kind: "move_absolute",
                    args: {
                      location: {
                        kind: "identifier",
                        args: { label: "parent" }
                      },
                      offset:   {
                        kind: "coordinate",
                        args: { x: 0, y: 0, z: 0 }
                      },
                      speed:    100,
                    }
                  }
                ]
              }
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(422)
      expect(json[:body]).to eq("Unbound variable: parent")
    end

    it 'does not let you use other peoples point resources' do
      sign_in user
      not_yours = FactoryBot.create(:plant)
      expect(not_yours.device_id).to_not eq(user.device_id)
      input = {
        name: "bad point usage",
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
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(422)
      expect(json[:body]).to include("Bad point ID")
    end

    it 'prevents type errors from bad identifier / binding combos' do
      sign_in user
      input = { name: "type mismatch",
                args: {
                  locals: {
                    kind: "scope_declaration",
                    args: {},
                    body: [
                      {
                        kind: "parameter_declaration",
                        args: {
                          label: "parent",
                          default_value: { kind: "sync", args: {} }
                        }
                      }
                    ]
                  }
                },
                body: [
                  { kind: "move_absolute",
                    args: {
                      location: { kind: "identifier", args: { label: "parent" } },
                      offset:   {
                        kind: "coordinate",
                        args: { x: 0, y: 0, z: 0 }
                      },
                      speed:    100,
                    }
                  }
                ]
              }
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(422)
      expect(json.fetch(:body)).to include('"point"')
      expect(json[:body]).to include("but got sync")
    end

    it 'provides human readable errors for "nothing" mismatches' do
      sign_in user
      input = { name: "type mismatch",
                args: {
                  locals: {
                    kind: "scope_declaration",
                    args: { },
                    body: [
                      {
                        kind: "parameter_declaration",
                        args: {
                          label: "x",
                          default_value: {
                            kind: "nothing",
                            args: {}
                          }
                        }
                      }
                    ]
                  }
                },
                body: [ ]
              }
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(422)
      expect(json[:body]).to include("must provide a value for all parameters")
    end
  end
end
