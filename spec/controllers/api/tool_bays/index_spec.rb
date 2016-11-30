require 'spec_helper'

describe Api::ToolBaysController do
  include Devise::Test::ControllerHelpers
  describe '#show' do
    let(:user) { FactoryGirl.create(:user) }
    let!(:tool_bay) { FactoryGirl.create(:tool_bay, device: user.device) }

    it 'updates a tool bay' do
      sign_in user
      get :index
      expect(json.first[:id]).to eq(tool_bay.id)      
      expect(json.first[:name]).to eq(tool_bay.name)      
    end
  end
end
