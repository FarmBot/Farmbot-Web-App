require "spec_helper"

describe Api::ToolsController do
  include Devise::Test::ControllerHelpers
  describe "#update" do
    let(:user) { FactoryBot.create(:user) }
    let(:tool_slot) { FactoryBot.create(:tool_slot) }
    let!(:tool) { FactoryBot.create(:tool,
                    tool_slot: tool_slot,
                    device: user.device) }

    it "changes the name" do
      sign_in user
      patch :update, params: { id: tool.id, name: "Hi!" }
      expect(response.status).to eq(200)
      expect(tool.reload.name).to eq("Hi!")
    end

    it "updates a tool with an invalid pullout direction (and fails)" do
      bad_dir = 99
      sign_in user
      patch :update, params: { id: tool.id, pullout_direction: bad_dir }
      expect(response.status).to eq(422)
      expect(tool.reload.pullout_direction).not_to eq(bad_dir)
    end

    it "updates a tool with an valid pullout direction" do
      direction = 1
      sign_in   user
      patch :update, params: { id: tool.id, pullout_direction: direction }
      expect(response.status).to eq(200)
      expect(tool.reload.pullout_direction).to eq(direction)
    end
  end
end
