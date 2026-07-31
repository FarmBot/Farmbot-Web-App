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
      put :update,
        body: { name: "Hi!" }.to_json,
        params: {id: tool.id, format: :json }
      expect(response.status).to eq(200)
      expect(tool.reload.name).to eq("Hi!")
    end

    it "prevents updates to another device's tool" do
      expect do
        Tools::Update.run!(tool: tool,
                           device: FactoryBot.create(:device),
                           name: "Not allowed")
      end.to raise_error(Errors::Forbidden)
    end
  end
end
