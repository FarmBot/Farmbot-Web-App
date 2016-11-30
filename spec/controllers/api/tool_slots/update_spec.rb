require 'spec_helper'

describe Api::ToolBaysController do
  include Devise::Test::ControllerHelpers
  describe '#update' do
    let(:user) { FactoryGirl.create(:user) }
    let!(:tool_bay) { FactoryGirl.create(:tool_bay, device: user.device) }
    let!(:tool_slot) { FactoryGirl.create(:tool_slot, tool_bay: tool_bay) }

    it 'updates a tool bay' do
      sign_in user
      payload = { name: "Fooo", id: tool_bay.id }
      expect(tool_bay.name).not_to eq(payload[:name])
      patch :update, params: payload
      tool_bay.reload
      expect(response.status).to eq(200)
      expect(tool_bay.name).to eq(payload[:name])
      expect(json[:name]).to eq(payload[:name])      
    end
  end
end
