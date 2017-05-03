require 'spec_helper'

describe Api::ToolSlotsController do
  include Devise::Test::ControllerHelpers
  describe '#create' do
    let(:user) { FactoryGirl.create(:user) }

    it 'creates a tool slot' do
      sign_in user
      payload = { name: "Fooo",
                  x: 4,
                  y: 5,
                  z: 6 }
      before = ToolSlot.count
      post :create, body: payload.to_json, format: :json
      after = ToolSlot.count
      expect(before).to be < after
      expect(response.status).to eq(200)
      expect(json[:name]).to eq(payload[:name])
      expect(json[:x]).to eq(payload[:x])
      expect(json[:y]).to eq(payload[:y])
      expect(json[:z]).to eq(payload[:z])
    end
  end
end
