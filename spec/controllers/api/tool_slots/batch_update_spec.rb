require 'spec_helper'

describe Api::ToolSlotsController do
  include Devise::Test::ControllerHelpers
  describe 'batch updates' do
    let(:user) { FactoryGirl.create(:user) }
    let!(:tool_slots) do
      FactoryGirl.create_list(:tool_slot_point, 3).map(&:pointer)
    end

  end
end
