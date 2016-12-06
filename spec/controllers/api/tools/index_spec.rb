require 'spec_helper'

describe Api::ToolsController do
  include Devise::Test::ControllerHelpers
  describe '#index' do
    let(:user) { FactoryGirl.create(:user) }
    let(:tool_bay) { FactoryGirl.create(:tool_bay, device: user.device) }
    let(:tool_slot) { FactoryGirl.create(:tool_slot, tool_bay: tool_bay) }
    let(:tools) { FactoryGirl.create_list(:tool, 1, tool_slot: tool_slot) }
    let!(:tools) { FactoryGirl.create_list(:tool,
                    1,
                    tool_slot: tool_slot,
                    device: user.device) }

    it 'lists all tools' do
      tools
      sign_in user
      get :index
      expect(response.status).to eq(200)
      expect(json.first[:id]).to eq(tools.first.id)
    end
  end
end
