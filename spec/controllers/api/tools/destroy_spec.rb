require 'spec_helper'

describe Api::ToolsController do
  include Devise::Test::ControllerHelpers
  describe '#destroy' do
    let(:user) { FactoryGirl.create(:user) }
    let(:tool_slot) { FactoryGirl.create(:tool_slot) }
    let!(:tool) {
        ToolSlot.destroy_all
        Tool.destroy_all
        FactoryGirl.create(:tool,
        tool_slot: tool_slot,
        device: user.device) }

    it 'destroy a tool' do
      sign_in user
      before = Tool.count
      tool.tool_slot.update_attributes(tool: nil)
      delete :destroy, params: { id: tool.id }
      after = Tool.count
      expect(response.status).to eq(200)
      expect(before).to be > after
    end

    it 'does not destroy a tool when in use by a sequence' do
      before = SequenceDependency.count
      program = [
        {
          kind: "move_absolute",
          args: {
              location: {
                kind: "tool",
                args: {
                  tool_id: tool.id
                }
              },
              offset: {
                kind: "coordinate",
                args: {x: 1, y: 2, z: 3}
              },
              speed: 100
          }
        }
      ]
      Sequences::Create.run!(name:   "Dep. tracking",
                             device: user.device,
                             body:   program)
      expect(SequenceDependency.count).to be > before
      sequence = Sequence.last
      sd_list = SequenceDependency
                  .where(sequence: sequence)
                  .map(&:dependency)
      expect(sd_list).to include(tool)
      # expect(sd_list).to include(tool.slot)

      sign_in user
      tool.tool_slot.update_attributes(tool: nil)
      before = Tool.count
      delete :destroy, params: { id: tool.id }
      after = Tool.count
      expect(response.status).to eq(422)
      expect(before).to eq(after)
      expect(json[:tool]).to include(
        Tools::Destroy::STILL_IN_USE % sequence.name)
    end

    it 'does not destroy a tool when in a slot' do
      sign_in user
      before = Tool.count
      delete :destroy, params: { id: tool.id }
      after = Tool.count
      expect(response.status).to eq(422)
      expect(before).to eq(after)
      expect(json[:tool]).to include(Tools::Destroy::STILL_IN_SLOT)
    end
  end
end
