require 'spec_helper'

describe Api::ToolsController do
  include Devise::Test::ControllerHelpers
  describe '#create' do
    let(:user) { FactoryBot.create(:user) }
    let(:tool_slot) { FactoryBot.create(:tool_slot) }

    it 'creates a new tool' do
      sign_in user
      payload = { tool_slot_id: tool_slot.id, name: "wow" }
      old_tool_count = Tool.count
      post :create, body: payload.to_json, params: {format: :json}
      expect(response.status).to eq(200)
      expect(Tool.count).to be > old_tool_count
      expect(json[:name]).to eq("wow")
    end

    it "creates a tool with an invalid pullout direction (and fails)" do
      bad_dir = 99
      sign_in user
      before_count = Tool.count
      post :create,
           body: { pullout_direction: bad_dir }.to_json,
           params: {format: :json}
      expect(response.status).to eq(422)
      expect(Tool.count).to eq(before_count)
      expect(json[:pullout_direction]).not_to eq(bad_dir)
    end
  end
end
