require 'spec_helper'

describe Api::ToolSlotsController do
  include Devise::Test::ControllerHelpers
  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }
    let!(:tool_bay) { FactoryGirl.create(:tool_bay, device: user.device) }

    it 'creates a tool slot' do
      sign_in user
      payload = { name: "Fooo",
                  tool_bay_id: tool_bay.id,
                  x: 4,
                  y: 5,
                  z: 6 }
      before = ToolSlot.count
      post :create, params: payload
      after = ToolSlot.count
      expect(before).to be < after
      expect(response.status).to eq(200)
      expect(json[:name]).to eq(payload[:name])      
      expect(json[:x]).to eq(payload[:x])      
      expect(json[:y]).to eq(payload[:y])      
      expect(json[:z]).to eq(payload[:z])      
      expect(json[:tool_bay_id]).to eq(payload[:tool_bay_id])      
    end
  end
end
