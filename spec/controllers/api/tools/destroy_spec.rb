require 'spec_helper'

describe Api::ToolsController do
  include Devise::Test::ControllerHelpers
  describe '#destroy' do
    let(:user) { FactoryBot.create(:user) }
    let(:tool_slot) { FactoryBot.create(:tool_slot) }
    let!(:tool) {
        Point.destroy_all
        FactoryBot.create(:tool,
                           tool_slot: tool_slot,
                           device: user.device) }

    it 'destroy a tool' do
      sign_in user
      before = Tool.count
      tool.tool_slot.update(tool: nil)
      delete :destroy, params: { id: tool.id }
      after = Tool.count
      expect(response.status).to eq(200)
      expect(before).to be > after
    end

    it 'does not destroy a tool when in use by a sequence' do
      PinBinding.destroy_all
      Sequence.destroy_all
      Sequences::Create.run!(name:   "Dep. tracking",
                             device: user.device,
                             body:   [
                              {
                                kind: "move_absolute",
                                args: {
                                    location: { kind: "tool", args: { tool_id: tool.id }
                                    },
                                    offset: { kind: "coordinate", args: {x: 1, y: 2, z: 3} },
                                    speed: 100
                                }
                              }
                            ])
      sequence = Sequence.last
      sd_list  = EdgeNode
        .where(kind: "tool_id", sequence: sequence)
        .map { |x| Tool.find(x.value) }
      sign_in user
      # If we dont do this, it will trigger the wrong error.
      # We test this elsewhere - RC
      tool.tool_slot.update(tool: nil)

      before = Tool.count
      delete :destroy, params: { id: tool.id }
      after = Tool.count

      expect(response.status).to eq(422)
      expect(before).to eq(after)
      expect(json[:tool])
        .to include(Tools::Destroy::STILL_IN_USE % sequence.name)
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
