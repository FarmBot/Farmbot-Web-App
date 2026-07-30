require 'spec_helper'

describe Api::ToolsController do
  include Devise::Test::ControllerHelpers
  describe '#show' do
    let(:user) { FactoryBot.create(:user) }
    let(:tool_slot) { FactoryBot.create(:tool_slot) }
    let(:tool) { FactoryBot.create(:tool,
                    tool_slot: tool_slot,
                    device: user.device) }

    it 'renders a tool' do
      sign_in user
      get :show, params: { id: tool.id }
      expect(response.status).to eq(200)
      expect(json[:id]).to eq(tool.id)
    end

    it "does not render another device's tool" do
      other_tool = FactoryBot.create(:tool)
      sign_in user
      get :show, params: { id: other_tool.id }
      expect(response.status).to eq(404)
    end
  end
end
