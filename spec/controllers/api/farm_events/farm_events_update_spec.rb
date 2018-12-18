require "spec_helper"

describe Api::FarmEventsController do
  include Devise::Test::ControllerHelpers

  describe "#update" do
    let(:user) { FactoryBot.create(:user) }

    it "allows authorized modification" do
      sign_in user
      id = FactoryBot.create(:farm_event, device: user.device).id
      input = { id: id, farm_event: { repeat: 66 } }
      patch :update, format: :json, body: input.to_json, params: {id: id}
      expect(response.status).to eq(200)
    end

    it "prevents unauthorized modification" do
      sign_in user
      id    = FactoryBot.create(:farm_event).id
      input = { id: id, repeat: 66 }
      patch :update, format: :json, body: input.to_json, params: {id: id}
      expect(response.status).to eq(403)
      expect(json[:error]).to include("Not your farm_event")
    end

    it "sets end_time to self.start_time if no start_time is passed in" do
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

    it "disallows start/end times that are outside of a 20 year window" do
      sign_in user
      id = FactoryBot.create(:farm_event, device: user.device).id
      patch :update,
            format: :json,
            body:   { id: id, end_time: "+045633-08-18T13:25:00.000Z" }.to_json,
            params: { id: id }
      expect(response.status).to eq(422)
      expect(json[:end_time]).to include("too far in the future")
    end

    def create_fe_with_fragment
      fragment = Fragment.from_celery(
        device: user.device,
        kind:   "internal_farm_event",
        args:   {},
        body:   [
          {
            kind: "variable_declaration",
            args: {
              label: "foo",
              data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
            }
          }
        ])
      FactoryBot.create(:farm_event, device: user.device, fragment: fragment)
    end

    def update_body(fe, body)
      sign_in user
      patch :update,
        format: :json,
        body:   { body: body }.to_json,
        params: { id: fe.id }
    end

    it "ignores fragment when body is `nil`" do
      fe          = create_fe_with_fragment
      fragment_b4 = fe.fragment.id
      expect(fe.fragment).not_to be(nil)
      update_body(fe, nil)
      expect(response.status).to be(200)
      expect(fe.reload.fragment).not_to be(nil)
      expect(fe.fragment.id).to         eq(fragment_b4)
    end

    it "deletes old fragment when body is `[]`" do
      fe = create_fe_with_fragment
      expect(fe.fragment).not_to be(nil)
      update_body(fe, [])
      expect(response.status).to be(200)
      expect(fe.reload.fragment).to be(nil)
      expect(json.fetch(:body)).to eq([])
    end

    it "replaces old fragment when given a new one" do
      fe = create_fe_with_fragment
      expect(fe.fragment).not_to be(nil)
      update_body(fe, nil)
      expect(response.status).to be(200)
      expect(fe.reload.fragment).not_to be(nil)
    end

    it "inserts new fragment when there originally was none" do
      fe = FactoryBot.create(:farm_event, device: user.device)
      expect(fe.fragment).to be(nil)
      body = [
        {
          kind: "variable_declaration",
          args: {
            label: "bar",
            data_value: {
              kind: "coordinate",
              args: {
                x: 1,
                y: 2,
                z: 3
              }
            }
          }
        }
      ]
      update_body(fe, body)
      expect(response.status).to be(200)
      expect(fe.reload.fragment).not_to be(nil)
      expect(json.fetch(:body)).to eq(body)
    end
  end
end
