require 'spec_helper'

describe Api::ToolsController do
  include Devise::Test::ControllerHelpers
  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }
    let(:tool_bay) { FactoryGirl.create(:tool_bay, device: user.device) }
    let(:tool_slot) { FactoryGirl.create(:tool_slot, tool_bay: tool_bay) }

    it 'creates a new tool' do
      sign_in user
      payload = { tool_slot_id: tool_slot.id, name: "wow" }
      old_tool_count = Tool.count
      post :create, params: payload
      expect(response.status).to eq(200)
      expect(Tool.count).to be > old_tool_count
      expect(json[:name]).to eq("wow")
    end
  end
end
