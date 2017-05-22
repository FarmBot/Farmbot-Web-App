require 'spec_helper'

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe '#update' do
    let(:device) { FactoryGirl.create(:device) }
    let(:user) { FactoryGirl.create(:user, device: device) }
    let!(:point) { FactoryGirl.create(:point, device: device) }

    it 'updates a point' do
      sign_in user
      body = { x:      99,
               y:      87,
               z:      33,
               radius: 55,
               meta: { foo: "BAR" } }
      put :update, body: body.to_json,
                   params: { format: :json, id: point.id }
      expect(response.status).to eq(200)
      expect(json[:x]).to eq(body[:x])
      expect(json[:y]).to eq(body[:y])
      expect(json[:z]).to eq(body[:z])
      expect(json[:radius]).to eq(body[:radius])
      expect(json[:meta][:foo]).to eq(body[:meta][:foo])
      expect(Point.last.device).to eq(device)
    end

    it 'updates a plant' do
      point = Point.create(x: 0,
                           y: 0,
                           z: 0,
                           radius: 1,
                           pointer: Plant.new(openfarm_slug: "lettuce"),
                           device: user.device)
      expect(point.pointer_type).to eq("Plant")
      sign_in user
      p = { id: point.id,
            x: 23,
            y: 45,
            name: "My Lettuce",
            openfarm_slug: "limestone-lettuce" }
      put :update, body: p.to_json, params: { format: :json, id: point.id }
      expect(response.status).to eq(200)
      point.reload
      expect(point.x).to eq(p[:x])
      expect(point.y).to eq(p[:y])
      expect(point.name).to eq(p[:name])
      expect(point.pointer_type).to eq("Plant")
      expect(point.pointer.openfarm_slug).to eq(p[:openfarm_slug])
      p.keys.each do |key|
        expect(json).to have_key(key)
      end
    end
  end
end
