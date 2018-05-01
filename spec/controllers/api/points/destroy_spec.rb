require 'spec_helper'

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe '#destroy' do
    sequence_fixture = <<~HEREDOC
      [{ "kind":"move_absolute",
      "args":{
          "location":{ "kind":"tool", "args":{ "tool_id": --- } },
          "offset":{ "kind":"coordinate", "args":{ "x":0, "y":0, "z":0 } },
          "speed":100}}]
    HEREDOC
    let(:device) { FactoryBot.create(:device) }
    let(:user) { FactoryBot.create(:user, device: device) }
    let!(:point) { FactoryBot.create(:generic_pointer, device: device) }
    let(:plant) {
      Plant.create!(x:             10,
                    y:             20,
                    z:             30,
                    radius:        1,
                    openfarm_slug: "lettuce",
                    pointer_type:  "Plant",
                    device:        device)
    }
    let(:tool) {Tool.create!(device: user.device)}
    let!(:tool_slot) do
      ToolSlot.create(x:            0,
                      y:            0,
                      z:            0,
                      radius:       50,
                      name:         "Whatever",
                      pointer_type: "ToolSlot",
                      device:       user.device,
                      tool_id:      tool.id)
    end
    let!(:sequence) { Sequences::Create.run!({
                    device: user.device,
                    name: "TOOL SLOT",
                    body: JSON.parse(sequence_fixture.gsub("---", tool.id.to_s))
                  }) }

    it 'deletes a plant' do
      Point.destroy_all
      expect(Plant.count).to eq(0)
      plant
      sign_in user
      b4 = Plant.kept.count
      delete :destroy, params: { id: plant.id }
      expect(response.status).to eq(200)
      expect(Plant.kept.count).to eq(b4 - 1)
    end

    it 'deletes a point' do
      sign_in user
      b4 = Point.kept.count
      delete :destroy, params: { id: point.id }
      expect(response.status).to eq(200)
      expect(Point.kept.count).to eq(b4 - 1)
    end

    it 'performs batch deletion' do
      sign_in user
      points       = FactoryBot.create_list(:generic_pointer, 6, device: user.device)
      before_count = Point.kept.count
      delete :destroy, params: { id: points.map(&:id).join(",") }
      expect(Point.kept.count).to eq(before_count - 6)
    end
  end
end
