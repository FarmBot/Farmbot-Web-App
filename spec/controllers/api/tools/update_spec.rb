require "spec_helper"

describe Api::ToolsController do
  include Devise::Test::ControllerHelpers
  describe "#update" do
    let(:user) { FactoryBot.create(:user) }
    let(:tool_slot) { FactoryBot.create(:tool_slot) }
    let!(:tool) { FactoryBot.create(:tool,
                    tool_slot: tool_slot,
                    device: user.device) }

    it "changes tool attributes" do
      sign_in user
      body = { name: "Hi!",
               type: "soil_sensor",
               utm_mountable: false,
               effector_offset_x: 4.5,
               effector_offset_y: 5.5,
               effector_offset_z: 6.5 }
      put :update,
        body: body.to_json,
        params: {id: tool.id, format: :json }
      expect(response.status).to eq(200)
      tool.reload
      body.each { |key, value| expect(tool.send(key)).to eq(value) }
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
