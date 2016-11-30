require 'spec_helper'

describe Api::ToolBaysController do
  include Devise::Test::ControllerHelpers
  describe '#show' do
    let(:user) { FactoryGirl.create(:user) }
    let(:tool_bay) { FactoryGirl.create(:tool_bay, device: user.device) }

    it 'updates a tool bay' do
      sign_in user
      payload = { id: tool_bay.id }
      get :show, params: payload
      expect(payload[:id]).to eq(json[:id])      
      expect(json[:name]).to eq(tool_bay.name)      
    end
  end
end
