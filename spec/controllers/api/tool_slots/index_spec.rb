require 'spec_helper'

describe Api::ToolSlotsController do
  include Devise::Test::ControllerHelpers
  describe '#show' do
    let(:user) { FactoryGirl.create(:user) }
    let!(:tool_bay) { FactoryGirl.create(:tool_bay, device: user.device) }

    it 'updates a tool slot' do
      sign_in user
      ts = ToolSlot.create(tool_bay: tool_bay)
      get :index
      expect(json.first[:id]).to eq(ts.id)      
      expect(json.first[:name]).to eq(ts.name)      
    end
  end
end
