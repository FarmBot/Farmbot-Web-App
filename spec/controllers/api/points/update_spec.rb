require 'spec_helper'

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe '#update' do
    let(:device) { FactoryBot.create(:device) }
    let(:user) { FactoryBot.create(:user, device: device) }
    let!(:point) { FactoryBot.create(:generic_pointer, device: device) }
    let(:slot) { ToolSlot.create!(x:            0,
                                  y:            0,
                                  z:            0,
                                  radius:       1,
                                  pointer_id:   0,
                                  pointer_type: "ToolSlot",
                                  device_id:  user.device.id) }

    it 'updates a point' do
      sign_in user
      body  = { x:      99,
                y:      87,
                z:      33,
                radius: 55,
                meta: { foo: "BAR" } }
      put :update, body: body.to_json, params: { format: :json, id: point.id }
      expect(response.status).to eq(200)
      expect(json[:x]).to eq(body[:x])
      expect(json[:y]).to eq(body[:y])
      expect(json[:z]).to eq(body[:z])
      expect(json[:radius]).to eq(body[:radius])
      expect(json[:meta][:foo]).to eq(body[:meta][:foo])
      expect(Point.last.device).to eq(device)
    end

    it 'updates a plant' do
      point = Plant.create!(x:             0,
                            y:             0,
                            z:             0,
                            radius:        1,
                            openfarm_slug: "lettuce",
                            device:        user.device,
                            pointer_type:  "Plant",
                            pointer_id:    0)
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
      expect(point.openfarm_slug).to eq(p[:openfarm_slug])
      p.keys.each do |key|
        expect(json).to have_key(key)
      end
    end

    it "updates a tool with an invalid pullout direction (and fails)" do
      bad_dir = 99
      slot
      sign_in user
      put :update,
        body: { pullout_direction: bad_dir }.to_json,
        params: {id: slot.id, format: :json }
      expect(response.status).to eq(422)
      expect(slot.reload.pullout_direction).not_to eq(bad_dir)
    end

    it "updates a tool slot with an valid pullout direction" do
      direction = 1
      slot
      sign_in user
      put :update, body: { pullout_direction: direction }.to_json,
        params: {id: slot.id, format: :json }
      expect(response.status).to eq(200)
      expect(slot.reload.pullout_direction).to eq(direction)
    end
  end
end
