require 'spec_helper'

describe Api::ToolSlotsController do
  include Devise::Test::ControllerHelpers
  describe '#destroy' do
    let(:user) { FactoryGirl.create(:user) }
    let!(:tool_bay) { FactoryGirl.create(:tool_bay, device: user.device) }
    let!(:tool_slot) { FactoryGirl.create(:tool_slot, tool_bay: tool_bay) }

    it 'removes a tool slot' do
      sign_in user
      payload = { id: tool_slot.id }
      before = ToolSlot.count
      delete :destroy, params: payload
      expect(response.status).to eq(200)
      after = ToolSlot.count
      expect(response.status).to eq(200)
      expect(after).to be < before
    end
  end
end
