require "spec_helper"

describe Api::FarmEventsController do
  include Devise::Test::ControllerHelpers

  describe "#create" do
    start_time = (Time.now + 1.hour).to_json.gsub("\"", "")

    let(:user) { FactoryBot.create(:user) }
    let(:sequence) { FakeSequence.create(device: user.device) }
    let(:regimen) { FactoryBot.create(:regimen, device: user.device) }
    let(:tool) { FactoryBot.create(:tool, device: user.device) }
    let(:generic_fe) do
      { start_time: start_time,
        next_time: "2017-06-05T18:33:04.342Z",
        time_unit: "never",
        executable_id: regimen.id,
        executable_type: "Regimen",
        end_time: "2017-06-05T18:34:00.000Z",
        repeat: 1 }
    end

    it "processes properly formed celery script" do
      sign_in user
      payload = generic_fe.merge(body: [
                                   {
                                     kind: "parameter_application",
                                     args: {
                                       label: "wow",
                                       data_value: {
                                         kind: "tool",
                                         args: { tool_id: tool.id },
                                       },
                                     },
                                   },
                                 ])
      fragment_b4 = Fragment.count
      farm_event_b4 = FarmEvent.count
      post :create, body: payload.to_json
      expect(response.status).to eq(200)
      expect(Fragment.count).to be > fragment_b4
      expect(FarmEvent.count).to be > farm_event_b4
      expect(json.fetch(:body)).to eq(payload.fetch(:body))
    end

    it "rejects the use of identifiers in `farm_event.body`" do
      sign_in user
      wrong = { kind: "identifier", args: { label: "wrong" } }
      body = [
        {
          kind: "parameter_application",
          args: {
            label: "also_wrong",
            data_value: wrong,
          },
        },
      ]
      body = generic_fe.merge(body: body)
      post :create, body: body.to_json
      expect(response.status).to eq(422)
      expect(json.keys).to include(:farm_event)
      expect(json[:farm_event].downcase).to include("unbound variable")
    end

    it "gets rejected for sending malformed `body` attrs" do
      sign_in user
      body = generic_fe.merge({
        body: [
          {
            kind: "parameter_application",
            args: { kind: "tool", args: { tool_id: 0 } },
          },
          {
            kind: "parameter_application",
            args: { kind: "tool", args: { tool_id: 0 } },
          },
        ],
      })
      post :create, body: body.to_json
      expect(response.status).to eq(422)
      expect(json.keys).to include(:farm_event)
      expect(json[:farm_event]).to include("'parameter_application' to have a 'label'")
    end

    it "prevents creation of unusually large farm_events" do
      sign_in user
      input = { executable_id: sequence.id,
                executable_type: sequence.class.name,
                start_time: (Time.now + 1.minute).as_json,
                end_time: "2029-02-17T18:19:20.000Z",
                repeat: 4,
                time_unit: "minutely" }
      before = FarmEvent.count
      post :create, body: input.to_json
      expect(response.status).to eq(422)
      expect(json.fetch(:occurrences)).to include("Farm events can't have more than 500 occurrences")
    end

    it "makes a farm_event" do
      sign_in user
      input = { executable_id: sequence.id,
                executable_type: sequence.class.name,
                start_time: (Time.now + 1.minute).as_json,
                end_time: (Time.now + 30.days).as_json,
                repeat: 4,
                time_unit: "daily" }
      before = FarmEvent.count
      post :create, body: input.to_json
      expect(response.status).to eq(200)
      expect(before < FarmEvent.count).to be_truthy
    end

    it "handles missing farm_event id" do
      sign_in user
      input = { start_time: "2025-02-17T15:16:17.000Z",
                end_time: "2029-02-17T18:19:20.000Z",
                repeat: 4,
                time_unit: "minutely" }
      post :create, body: input.to_json
      expect(response.status).to eq(422)
      expect(json.keys).to include(:farm_event)
    end

    it "creates a one-off FarmEvent" do
      sign_in user
      post :create, body: generic_fe.to_json, format: :json
      expect(response.status).to eq(200)
      get :index
      expect(json.length).to eq(1)
    end

    it "disallows FarmEvents too far in the past" do
      sign_in user
      r = FactoryBot.create(:regimen, device: user.device)
      input = { "start_time": (Time.now - 40.years).as_json,
                "time_unit": "never",
                "executable_id": r.id,
                "executable_type": "Regimen",
                "end_time": "2017-06-05T18:34:00.000Z",
                "repeat": 1 }
      post :create, body: input.to_json
      expect(response.status).to eq(422)
      expect(json[:start_time]).to include("too far in the past")
    end

    it "allows FarmEvents (reasonably) in the past" do
      sign_in user
      r = FactoryBot.create(:regimen, device: user.device)
      input = { "start_time": (Time.now - 2.weeks).as_json,
                "time_unit": "never",
                "executable_id": r.id,
                "executable_type": "Regimen",
                "end_time": "2017-06-05T18:34:00.000Z",
                "repeat": 1 }
      post :create, body: input.to_json
      expect(response.status).to eq(200)
    end

    it "allows use of parameterized sequences" do
      sign_in user
      s = FakeSequence.with_parameters(device: user.device)
      input = { "end_time": Time.now.as_json,
                "time_unit": "never",
                "executable_id": s.id,
                "executable_type": "Sequence",
                "repeat": 1 }
      post :create, body: input.to_json
      expect(response.status).to eq(200)
    end

    it "disallows FarmEvents too far in the future" do
      sign_in user
      r = FactoryBot.create(:regimen, device: user.device)
      input = { "end_time": "+099999-08-18T13:54:00.000Z",
                "time_unit": "never",
                "executable_id": r.id,
                "executable_type": "Regimen",
                "repeat": 1 }
      post :create, body: input.to_json
      expect(response.status).to eq(422)
      expect(json[:end_time]).to include("too far in the future")
    end
  end
end
