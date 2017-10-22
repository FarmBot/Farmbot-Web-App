require 'spec_helper'

describe Api::ToolsController do
  include Devise::Test::ControllerHelpers
  describe '#index' do
    let(:user) { FactoryBot.create(:user) }
    let(:tool_slot) { FactoryBot.create(:tool_slot) }
    let(:tools) { FactoryBot.create_list(:tool, 1, tool_slot: tool_slot) }
    let!(:tools) { FactoryBot.create_list(:tool,
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
