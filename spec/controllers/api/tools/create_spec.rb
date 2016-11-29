require 'spec_helper'

describe Api::ToolsController do
  include Devise::Test::ControllerHelpers
  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }
    let(:sequence) { FactoryGirl.create(:sequence, device: user.device) }
    it 'creates a new tool' do
      pending "Not done yet."
      sign_in user
      payload = {}
      old_tool_count = Tool.count
      post :create, params: payload

      expect(response.status).to eq(200)
      expect(Tool.count).to be > old_regimen_count
      expect(json[:foo]).to eq("bar")
    end
  end
end
