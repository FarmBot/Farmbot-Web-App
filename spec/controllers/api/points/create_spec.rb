require 'spec_helper'

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe '#create' do
    let(:user) { FactoryBot.create(:user) }
    let(:device) { user.device }

    it 'creates a tool slot' do
      sign_in user
      payload = { name: "Fooo", x: 4, y: 5, z: 6, pointer_type: "ToolSlot" }
      before = ToolSlot.count
      post :create, body: payload.to_json, format: :json
      expect(response.status).to eq(200)

      after = ToolSlot.count
      expect(before).to be < after
      expect(json[:name]).to eq(payload[:name])
      expect(json[:x]).to eq(payload[:x])
      expect(json[:y]).to eq(payload[:y])
      expect(json[:z]).to eq(payload[:z])
    end

    it 'creates a plant' do
      sign_in user
      time = (DateTime.now - 1.day).to_json
      p = { x: 23,
            y: 45,
            name: "My Lettuce",
            pointer_type: "Plant",
            openfarm_slug: "limestone-lettuce",
            planted_at: time }
      post :create, body: p.to_json, params: { format: :json }
      expect(response.status).to eq(200)
      plant = Plant.last
      expect(plant.point.x).to eq(p[:x])
      expect(plant.point.y).to eq(p[:y])
      expect(plant.point.name).to eq(p[:name])
      expect(plant.openfarm_slug).to eq(p[:openfarm_slug])
      expect(plant.created_at).to be_truthy
      p.keys.each do |key|
        expect(json).to have_key(key)
      end
    end

    it 'validates pointer_type' do
      sign_in user
      body = { pointer_type: "TypoPointer" }
      post :create, body: body.to_json, params: { format: :json }
      expect(response.status).to eq(422)
      expected = \
        "Please provide a JSON object with a `pointer_type` that matches"
      expect(json[:error]).to include(expected)
    end

    it 'creates a point' do
      sign_in user
      body = { x:            1,
               y:            2,
               z:            3,
               radius:       3,
               name:         "YOLO",
               pointer_type: "GenericPointer",
               meta:         { foo: "BAR" } }
      post :create, body: body.to_json, params: { format: :json }
      expect(response.status).to eq(200)
      expect(json[:name]).to eq(body[:name])
      expect(json[:x]).to eq(body[:x])
      expect(json[:y]).to eq(body[:y])
      expect(json[:z]).to eq(body[:z])
      expect(json[:radius]).to eq(body[:radius])
      expect(json[:pointer_type]).to eq(body[:pointer_type])
      expect(json[:meta][:foo]).to eq(body[:meta][:foo])
      expect(Point.last.device).to eq(device)
    end

    it 'requires x' do
      sign_in user
      body = { y:            2,
               z:            3,
               radius:       3,
               pointer_type: "GenericPointer",
               meta:         { foo: "BAR" } }
      post :create, body: body.to_json, params: { format: :json }
      expect(response.status).to eq(422)
      expect(json[:x]).to be
      expect(json[:x]).to include("is required")
      expect(json[:name]).to eq(nil)
    end

    it "handles bad data" do
      sign_in user
      SmarfDoc.note("This is what happens when you post bad JSON")
      post :create, body: "{'x': 0}", params: { format: :json }
      expect(response.status).to eq(422)
      expect(json[:error]).to include("Please use _valid_ JSON.")
    end

    it "creates a toolslot with an valid pullout direction" do
      direction = 1
      sign_in user
      before_count = ToolSlot.count
      post :create,
            body:   {
              pointer_type: "ToolSlot",
              name: "foo",
              x: 0,
              y: 0,
              z: 0,
              pullout_direction: direction
            }.to_json,
            params: { format: :json }
      expect(response.status).to eq(200)
      expect(ToolSlot.count).to be > before_count
      expect(json[:pullout_direction]).to eq(direction)
    end

    it 'creates a new toolslot, with a default pullout' do
      sign_in user
      payload = { pointer_type: "ToolSlot",
                  name: "foo",
                  x: 0,
                  y: 0,
                  z: 0 }
      old_tool_count = ToolSlot.count
      post :create, body: payload.to_json, params: {format: :json}
      expect(response.status).to eq(200)
      expect(ToolSlot.count).to be > old_tool_count
      expect(json[:pullout_direction]).to eq(0)
    end

    it 'disallows bad `tool_id`s' do
      sign_in user
      payload = { pointer_type: "ToolSlot",
                  name: "foo",
                  x: 0,
                  y: 0,
                  z: 0,
                  tool_id: (Tool.count + 100) }
      old_tool_count = ToolSlot.count
      post :create, body: payload.to_json, params: {format: :json}
      expect(response.status).to eq(422)
      expect(ToolSlot.count).to eq old_tool_count
      expect(json[:tool_id]).to include("Can't find tool")
    end
  end
end
