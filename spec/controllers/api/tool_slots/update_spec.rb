require 'spec_helper'

describe Api::ToolSlotsController do
  include Devise::Test::ControllerHelpers
  describe '#update' do
    let(:user) { FactoryGirl.create(:user) }
    let!(:tool_slot) do
      FactoryGirl.create(:tool_slot_point, device: user.device).pointer
    end
  end
end
