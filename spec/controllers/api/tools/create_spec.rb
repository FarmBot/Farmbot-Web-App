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

    it 'creates a new (detached) tool' do
      sign_in user
      payload = { name: "wow2" }
      old_tool_count = Tool.count
      post :create, body: payload.to_json, params: {format: :json}
      expect(response.status).to eq(200)
      expect(Tool.count).to be > old_tool_count
      expect(json[:pullout_direction]).to eq(0)
    end

    it "creates a tool with an invalid pullout direction (and fails)" do
      bad_dir = 99
      sign_in user
      before_count = Tool.count
      post :create, params: { pullout_direction: bad_dir }
      expect(response.status).to eq(422)
      expect(Tool.count).to eq(before_count)
      expect(tool.reload.pullout_direction).not.to eq(bad_dir)
    end

    it "creates a tool with an valid pullout direction" do
      direction = 1
      sign_in user
      before_count = Tool.count
      post :create, params: { pullout_direction: direction }
      expect(response.status).to eq(200)
      expect(Tool.count).to eq(before_count)
      expect(tool.reload.pullout_direction).to eq(direction)
    end

  end
end
