require "spec_helper"

describe Api::RegimensController do

  include Devise::Test::ControllerHelpers

  describe "#create" do
    let(:user)     { FactoryBot.create(:user) }
    let(:sequence) { FakeSequence.create(device: user.device) }

    it "creates a regimen that uses variables" do
      sign_in user
      s       = FakeSequence.with_parameters
      payload = { device: s.device,
                  name:   "specs",
                  color:  "red",
                  body: [
                    {
                      kind: "parameter_application",
                      args: {
                        label: "parent",
                        data_value: {
                          kind: "every_point", args: { every_point_type: "Plant" }
                        }
                      }
                    }
                  ],
                  regimen_items: [
                    { time_offset: 100, sequence_id: s.id }
                  ] }
      post :create, body: payload.to_json, format: :json
      expect(response.status).to eq(200)
      declr = json.fetch(:body).first
      expect(declr).to be
      expect(declr.fetch(:kind)).to eq("parameter_application")
      path = [:args, :data_value, :args, :every_point_type]
      expect(declr.dig(*path)).to eq("Plant")
    end

    it "creates a new regimen" do
      sign_in user
      color = %w(blue green yellow orange purple pink gray red).sample

      name = (1..3).map{ Faker::Pokemon.name }.join(" ")
      payload = {
          name: name,
          color: color ,
          regimen_items: [ {time_offset: 123, sequence_id: sequence.id} ]
      }

      old_regimen_count = Regimen.count
      old_item_count = RegimenItem.count

      post :create, body: payload.to_json, format: :json

      expect(response.status).to eq(200)
      expect(Regimen.count).to be > old_regimen_count
      expect(RegimenItem.count).to be > old_item_count
      expect(json[:name]).to eq(name)
      expect(json[:color]).to eq(color)
    end

    it "creates a regimen that uses unbound variables" do
      pending("TODO: Help Gabe with this.")
      sign_in user
      s       = FakeSequence.with_parameters
      payload = { device: s.device,
                  name:   "specs",
                  color:  "red",
                  body: [
                    {
                      kind: "parameter_application",
                      args: {
                        label: "parent",
                        data_value: {
                          kind: "identifier", args: { label: "parent" }
                        }
                      }
                    }
                  ],
                  regimen_items: [ { time_offset: 100, sequence_id: s.id } ] }
      post :create, body: payload.to_json, format: :json
      expect(response.status).to eq(200)
      declr = json.fetch(:body).first
      expect(declr).to be
      expect(declr.fetch(:kind)).to eq("parameter_application")
      path = [:args, :data_value, :args, :label]
      expect(declr.dig(*path)).to eq("parent")
    end

    it "handles CeleryScript::TypeCheckError" do
      sign_in user
      s       = FakeSequence.with_parameters
      payload = { device: s.device,
                  name:   "specs",
                  color:  "red",
                  body: [
                    {
                      kind: "parameter_application",
                      args: {
                        label: "parent",
                        data_value: { kind: "nothing", args: { } }
                      }
                    }
                  ],
                  regimen_items: [
                    { time_offset: 100, sequence_id: s.id }
                  ] }
      post :create, body: payload.to_json, format: :json
      expect(response.status).to eq(422)
      expect(json.fetch(:error))
        .to include("but got nothing")
    end
  end
end
