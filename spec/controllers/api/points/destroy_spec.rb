require 'spec_helper'

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe '#destroy' do
    sequence_fixture = <<~HEREDOC
      [{ "kind":"move_absolute",
      "args":{
          "location":{ "kind":"tool", "args":{ "tool_id": --- } },
          "offset":{ "kind":"coordinate", "args":{ "x":0, "y":0, "z":0 } },
          "speed":800}}]
    HEREDOC
    let(:device) { FactoryGirl.create(:device) }
    let(:user) { FactoryGirl.create(:user, device: device) }
    let!(:point) { FactoryGirl.create(:point, device: device) }
    let(:plant) {
      Point.create!(x:       10,
                    y:       20,
                    z:       30,
                    radius:  1,
                    pointer: Plant.create!(openfarm_slug: "lettuce"),
                    device:  device)
    }
    let(:tool) {Tool.create!(device: user.device)}
    let!(:tool_slot) do
      Point.create(x:       0,
                   y:       0,
                   z:       0,
                   radius:  50,
                   name:    "Whatever",
                   device: user.device,
                   pointer: ToolSlot.new(tool: tool)).pointer
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
      b4 = Plant.count
      delete :destroy, params: { id: plant.id }
      expect(response.status).to eq(200)
      expect(Plant.count).to eq(b4 - 1)
    end

    it 'deletes a point' do
      sign_in user
      b4 = Point.count
      delete :destroy, params: { id: point.id }
      expect(response.status).to eq(200)
      expect(Point.count).to eq(b4 - 1)
    end

    it 'performs batch deletion' do
      sign_in user
      points       = FactoryGirl.create_list(:point, 6, device: user.device)
      before_count = Point.count
      delete :destroy, params: { id: points.map(&:id).join(",") }
      expect(Point.count).to eq(before_count - 6)
    end
  end
end
