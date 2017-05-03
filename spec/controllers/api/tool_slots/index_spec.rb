require 'spec_helper'

describe Api::ToolSlotsController do
  include Devise::Test::ControllerHelpers
  describe '#show' do
    let(:user) { FactoryGirl.create(:user) }

    it 'lists all tool slots' do
      sign_in user
      ts = ToolSlot.create
      get :index
      expect(json.first[:id]).to eq(ts.id)
      expect(json.first[:name]).to eq(ts.name)
    end
  end
end
