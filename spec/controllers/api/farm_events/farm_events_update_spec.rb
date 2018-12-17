require 'spec_helper'

describe Api::FarmEventsController do
  include Devise::Test::ControllerHelpers

  describe '#update' do
    let(:user) { FactoryBot.create(:user) }

    it 'allows authorized modification' do
      sign_in user
      id = FactoryBot.create(:farm_event, device: user.device).id
      input = { id: id, farm_event: { repeat: 66 } }
      patch :update, format: :json, body: input.to_json, params: {id: id}
      expect(response.status).to eq(200)
    end

    it 'prevents unauthorized modification' do
      sign_in user
      id = FactoryBot.create(:farm_event).id
      input = { id: id, repeat: 66 }
      patch :update, format: :json, body: input.to_json, params: {id: id}
      expect(response.status).to eq(403)
      expect(json[:error]).to include('Not your farm_event')
    end

    it 'sets end_time to self.start_time if no start_time is passed in' do
      sign_in user
      id = FactoryBot.create(:farm_event, device: user.device).id
      patch :update,
      format: :json,
        body:   { id: id, repeat: 1, time_unit: FarmEvent::NEVER }.to_json,
        params: { id: id }
      fe = FarmEvent.find(id)
      expect(response.status).to eq(200)
      expect(json[:end_time]).to eq((fe.start_time + 1.minute).as_json)
      expect(fe.end_time).to eq(fe.start_time + 1.minute)
    end

    it 'disallows start/end times that are outside of a 20 year window' do
      sign_in user
      id = FactoryBot.create(:farm_event, device: user.device).id
      patch :update,
            format: :json,
            body:   { id: id, end_time: "+045633-08-18T13:25:00.000Z" }.to_json,
            params: { id: id }
      expect(response.status).to eq(422)
      expect(json[:end_time]).to include("too far in the future")
    end
  end
end
