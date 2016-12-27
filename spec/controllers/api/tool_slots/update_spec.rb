require 'spec_helper'

describe Api::ToolSlotsController do
  include Devise::Test::ControllerHelpers
  describe '#update' do
    let(:user) { FactoryGirl.create(:user) }
    let!(:tool_bay) { FactoryGirl.create(:tool_bay, device: user.device) }
    let!(:tool_slot) { FactoryGirl.create(:tool_slot, tool_bay: tool_bay) }

    it 'updates a tool slot' do
      sign_in user
      payload = { name: "Fooo" }
      expect(tool_slot.name).not_to eq(payload[:name])
      patch :update, body: payload.to_json, params: {id: tool_slot.id}
      tool_slot.reload
      expect(response.status).to eq(200)
      expect(tool_slot.name).to eq(payload[:name])
      expect(json[:name]).to eq(payload[:name])
    end
  end
end
