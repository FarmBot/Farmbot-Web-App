require 'spec_helper'

describe Api::ToolsController do
  include Devise::Test::ControllerHelpers
  describe '#destroy' do
    let(:user) { FactoryGirl.create(:user) }
    let(:tool_bay) { FactoryGirl.create(:tool_bay, device: user.device) }
    let(:tool_slot) { FactoryGirl.create(:tool_slot, tool_bay: tool_bay) }
    let!(:tool) { FactoryGirl.create(:tool,
                    tool_slot: tool_slot,
                    device: user.device) }

    it 'destroy a tool' do
      sign_in user
      before = Tool.count
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
      sd = SequenceDependency.last
      sequence = Sequence.last
      expect(sd.dependency).to eq(tool)
      expect(sd.sequence_id).to eq(sequence.id)

      sign_in user
      before = Tool.count
      delete :destroy, params: { id: tool.id }
      after = Tool.count
      expect(response.status).to eq(422)
      expect(before).to eq(after)
      expect(json[:tool]).to include(
        Tools::Destroy::STILL_IN_USE % sequence.name)
    end
  end
end
