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
      post :create,
           body: input.to_json,
           params: {format: :json}
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
      post :create,
           body: input.to_json,
           params: {format: :json}
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

    it 'tracks SequenceDependency' do
      SequenceDependency.destroy_all
      old_count = SequenceDependency.count
      sign_in user
      input = { name: "Scare Birds",
                body: nodes }
      sequence_body_for(user)
      post :create,
           body: input.to_json,
           params: {format: :json}
      expect(response.status).to eq(200)
      new_count       = SequenceDependency.count
      validated_count = SequenceDependency.where(sequence_id: json[:id]).count
      expect(old_count < new_count).to be(true)
      expect(validated_count).to eq(new_count)
    end

    it 'doesnt allow nonsense in `sequence.args.locals`' do
      input = { name: "Scare Birds",
                body: [],
                # Intentional nonsense to check validation logic.
                args: { locals: { kind: "wait", args: { milliseconds: 5000 } } }
              }

      sign_in user
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(422)
      expect(Sequence.last.args["locals"]["kind"]).to_not be("wait")
    end

    it 'strips excess `args`' do
      input = { name: "Scare Birds",
                body: [],
                # Intentional nonsense to check validation logic.
                args: { foo: "BAR" } }

      sign_in user
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(200)
      expect(json[:args][:foo]).to be(nil)
      expect(Sequence.last.args[:foo]).to eq(nil)
    end

    it 'disallows typo `data_types` in `locals` declaration' do
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
                  data_type: "PlantSpelledBackwards"
                }
              }
            ]
          }
        }
      }

      sign_in user
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(422)
      expect(json[:body]).to include("not a valid data_type")
    end

    it 'disallows erroneous `data_types` in `locals` declaration' do
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
      expect(json[:body])
        .to include("Expected one of: [:parameter_declaration]")
    end

    it 'allows declaration of a variable named `parent`' do
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
                  data_type: "point"
                }
              }
            ]
          }
        }
      }

      sign_in user
      post :create, body: input.to_json, params: {format: :json}
      expect(response.status).to eq(200)
      expect(Sequence.last.args.dig("locals", "body", 0, "args", "label"))
        .to eq("parent")
    end

    it 'tracks Points' do
      point = FactoryBot.create(:point, device: user.device)
      SequenceDependency.delete_all
      Sequence.delete_all
      old_count = SequenceDependency.count
      HAS_POINTS["body"][0]["args"]["location"]["args"]["pointer_id"] =
        point.id
      sign_in user
      input = { name: "Scare Birds",
                body: HAS_POINTS["body"] }
      sequence_body_for(user)
      post :create,
          body: input.to_json,
          params: {format: :json}
      expect(response.status).to eq(200)
      new_count       = SequenceDependency.count
      validated_count = SequenceDependency.where(sequence_id: json[:id]).count
      expect(old_count).to be < new_count
      expect(validated_count).to eq(new_count)
      expect(SequenceDependency.last.dependency.id).to eq(point.id)
    end

    it 'prevents unbound variables' do
      sign_in user
      input = {
                name: "Unbound Variable Exception",
                args: { scope: { kind: "nothing", args: {} } },
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

    it 'prevents type errors from bad identifier / binding combos'
  end
end
