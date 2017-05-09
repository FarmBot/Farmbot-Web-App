require 'spec_helper'

describe Api::ToolSlotsController do
  include Devise::Test::ControllerHelpers
  describe '#index' do
    let(:user) { FactoryGirl.create(:user) }

    it 'lists all tool slots' do
      sign_in user
      ts = Point.create(x: 0,
                        y: 0,
                        z: 0,
                        radius: 50,
                        name: "My TS",
                        device: user.device,
                        pointer: ToolSlot.new).pointer
      get :index
      expect(json.first[:id]).to eq(ts.id)
      expect(json.first[:name]).to eq(ts.point.name)
    end
  end
end
