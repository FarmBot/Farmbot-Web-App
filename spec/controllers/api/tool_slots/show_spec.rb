require 'spec_helper'

describe Api::ToolSlotsController do
  include Devise::Test::ControllerHelpers
  describe '#show' do
    let(:user) { FactoryGirl.create(:user) }
    let!(:tool_bay) { FactoryGirl.create(:tool_bay, device: user.device) }
    let!(:tool_slot) { FactoryGirl.create(:tool_slot, tool_bay: tool_bay) }

    it 'renders a tool slot' do
      sign_in user
      payload = { id: tool_slot.id }
      get :show, params: payload
      expect(response.status).to eq(200)
      that = tool_slot.as_json.symbolize_keys.except(:created_at, :updated_at)
      expect(that).to eq(json)
    end
  end
end
