require 'spec_helper'

describe Api::ToolSlotsController do
  include Devise::Test::ControllerHelpers



  describe '#destroy' do
    let(:user) { FactoryGirl.create(:user) }
    let!(:tool) { FactoryGirl.create(:tool, device: user.device) }
    let!(:tool_slot) do
      Point.create(x:       0,
                   y:       0,
                   z:       0,
                   radius:  50,
                   name:    "Whatever",
                   device: user.device,
                   pointer: ToolSlot.new(tool: tool)).pointer
    end

  end
end
