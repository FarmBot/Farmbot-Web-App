require 'spec_helper'

describe Api::ToolSlotsController do
  include Devise::Test::ControllerHelpers
  describe '#show' do
    let(:user) { FactoryGirl.create(:user) }
    let!(:tool_bay) { FactoryGirl.create(:tool_bay, device: user.device) }
    let!(:tool_slot) { FactoryGirl.create(:tool_slot, tool_bay: tool_bay) }

    it 'updates a tool slot' do
      sign_in user
      get :index
      expect(json.first[:id]).to eq(tool_bay.id)      
      expect(json.first[:name]).to eq(tool_bay.name)      
    end
  end
end
