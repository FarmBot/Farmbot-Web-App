require 'spec_helper'

describe Api::FarmEventsController do
  include Devise::Test::ControllerHelpers

  describe '#create' do
    start_time       = (Time.now + 1.hour).to_json.gsub("\"", "")

    let(:user)     { FactoryBot.create(:user) }
    let(:sequence) { FakeSequence.create() }
    let(:regimen)  { FactoryBot.create(:regimen, device: user.device) }
    let(:generic_sequence) do
      { start_time:      start_time,
        next_time:       "2017-06-05T18:33:04.342Z",
        time_unit:       "never",
        executable_id:   regimen.id,
        executable_type: "Regimen",
        end_time:        "2017-06-05T18:34:00.000Z",
        repeat:          1 }
    end

    it 'processes properly formed celery script'
    it 'rejects the use of identifiers in `farm_event.body`'
    it 'gets rejected for sending malformed `body` attrs' do
      sign_in user
      params = generic_sequence.merge({
        body: [
          {
            kind: "variable_declaration",
            args: { kind: "tool", args: { tool_id: 0 } }
          },
          {
            kind: "variable_declaration",
            args: { kind: "tool", args: { tool_id: 0 } }
          },
        ]
      })
      post :create, params: params
      expect(response.status).to eq(422)
      expect(json.keys).to include(:farm_event)
      expect(json[:farm_event])
        .to include("'variable_declaration' to have a 'label'")
    end

    it 'makes a farm_event' do
      sign_in user
      SmarfDoc.note("This is how you could create a FarmEvent that fires " +
                    "every 4 minutes.")
      input = { executable_id: sequence.id,
                executable_type: sequence.class.name,
                start_time: (Time.now + 1.minute).as_json,
                end_time: '2029-02-17T18:19:20.000Z',
                repeat: 4,
                time_unit: 'minutely' }
      before = FarmEvent.count
      post :create, params: input
      expect(response.status).to eq(200)
      expect(before < FarmEvent.count).to be_truthy
    end

    it 'handles missing farm_event id' do
      sign_in user
      input = { start_time: '2025-02-17T15:16:17.000Z',
                end_time:   '2029-02-17T18:19:20.000Z',
                repeat:     4,
                time_unit:  'minutely' }
      post :create, params: input
      expect(response.status).to eq(422)
      expect(json.keys).to include(:farm_event)
    end

    it 'creates a one-off FarmEvent' do
      sign_in user
      post :create, params: generic_sequence
      expect(response.status).to eq(200)
      get :index
      expect(json.length).to eq(1)
    end

    it 'disallows FarmEvents too far in the past' do
      sign_in user
      r = FactoryBot.create(:regimen, device: user.device)
      input = { "start_time": (Time.now - 40.years).as_json,
                "time_unit": "never",
                "executable_id": r.id,
                "executable_type": "Regimen",
                "end_time": "2017-06-05T18:34:00.000Z",
                "repeat": 1 }
      post :create, params: input
      expect(response.status).to eq(422)
      expect(json[:start_time]).to include("too far in the past")
    end

    it 'allows FarmEvents (reasonably) in the past' do
      sign_in user
      r = FactoryBot.create(:regimen, device: user.device)
      input = { "start_time": (Time.now - 2.weeks).as_json,
                "time_unit": "never",
                "executable_id": r.id,
                "executable_type": "Regimen",
                "end_time": "2017-06-05T18:34:00.000Z",
                "repeat": 1 }
      post :create, params: input
      expect(response.status).to eq(200)
    end

    it 'disallows use of parameterized sequences' do
      sign_in user
      s     = FakeSequence.with_parameters
      input = { "end_time": Time.now.as_json,
                "time_unit": "never",
                "executable_id": s.id,
                "executable_type": "Sequence",
                "repeat": 1 }
      post :create, params: input
      expect(response.status).to eq(422)
      expect(json[:sequence])
        .to include(Sequences::TransitionalHelpers::PARAMTERS_NOT_ALLOWED)
    end

    it 'disallows FarmEvents too far in the future' do
      sign_in user
      r = FactoryBot.create(:regimen, device: user.device)
      input = { "end_time": "+099999-08-18T13:54:00.000Z",
                "time_unit": "never",
                "executable_id": r.id,
                "executable_type": "Regimen",
                "repeat": 1 }
      post :create, params: input
      expect(response.status).to eq(422)
      expect(json[:end_time]).to include("too far in the future")
    end
  end
end
