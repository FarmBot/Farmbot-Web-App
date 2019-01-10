require "spec_helper"

describe Api::RegimensController do

  include Devise::Test::ControllerHelpers

  describe "#update" do
    let(:user) { FactoryBot.create(:user) }
    let(:sequence) { FakeSequence.create( device: user.device) }

    it "updates an old regimen" do
      sign_in user

      existing = Regimens::Create.run!(device: user.device, name: "x", color: "red", regimen_items: [])
      payload = {
        "id" => existing.id,
        "name" => "something new",
        "color" => "blue",
        "regimen_items" => [
            {
                "time_offset" => 1555500000,
                "sequence_id" => sequence.id
            },
            {
                "time_offset" => 864300000,
                "sequence_id" => sequence.id
            },
            {
                "time_offset" => 950700000,
                "sequence_id" => sequence.id
            }
        ]
        }
      put :update, body: payload.to_json, params: { id: existing.id }
      expect(response.status).to eq(200)
      expect(existing.reload.regimen_items.count).to eq(payload["regimen_items"].length)
      expect(json[:name]).to eq("something new")
      expect(existing.name).to eq("something new")
    end

    it "changes variable assignments in `body`" do
      sequence = FakeSequence.with_parameters
      user     = FactoryBot.create(:user, device: sequence.device)
      sign_in user

      var_declr = [
        {
          kind: "variable_declaration",
          args: {
            label: "parent",
            data_value: {
              kind: "coordinate",
              args: { x: 0, y: 0, z: 0 }
            }
          }
        }
      ]
      existing = Regimens::Create.run!(device:        user.device,
                                       name:          "x",
                                       color:         "red",
                                       regimen_items: [],
                                       body:          var_declr)
      payload = {
        id:    existing.id,
        name:  "something new",
        color: "blue",
        body:  [
          {
            kind: "variable_declaration",
            args: {
              label: "parent",
              data_value: {
                kind: "tool",
                args: {
                  tool_id: FactoryBot.create(:tool, device: sequence.device).id
                }
              }
            }
          }
        ],
        regimen_items: [
          {
            time_offset: 950700000,
            sequence_id: sequence.id
          }
        ]
      }
      put :update,
          body: payload.to_json,
          format: :json,
          params: { id: existing.id }
      expect(response.status).to eq(200)
      path = [:body, 0, :args, :data_value, :kind]
      expect(json.dig(*path)).to eq(payload.dig(*path))
    end

    it "catches bad regimen_items" do
      sign_in user
      existing = Regimens::Create.run!(device: user.device, name: "x", color: "red", regimen_items: [])
      payload = {
        "id"            => existing.id,
        "name"          => "something new",
        "color"         => "blue",
        "regimen_items" => [ { "time_offset" => 950700000, "sequence_id" => 0 } ]
        }
      put :update, body: payload.to_json, params: { id: existing.id }, format: :json
      expect(response.status).to eq(422)
      expect(json[:regimen_items]).to be
      expect(json[:regimen_items])
        .to include("Failed to instantiate nested RegimenItem.")
    end
  end
end
