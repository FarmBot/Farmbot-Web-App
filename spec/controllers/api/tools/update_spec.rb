require 'spec_helper'

describe Api::ToolsController do
  include Devise::Test::ControllerHelpers
  describe '#update' do
    let(:user) { FactoryGirl.create(:user) }
    let(:tool_slot) { FactoryGirl.create(:tool_slot, tool_bay: tool_bay) }
    let!(:tool) { FactoryGirl.create(:tool,
                    tool_slot: tool_slot,
                    device: user.device) }

    it 'changes the name' do
      sign_in user
      patch :update, params: { id: tool.id, name: "Hi!" }
      expect(response.status).to eq(200)
      expect(tool.reload.name).to eq("Hi!")
    end
  end
end
