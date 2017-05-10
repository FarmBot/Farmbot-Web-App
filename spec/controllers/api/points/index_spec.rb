require 'spec_helper'

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe '#index' do
    let(:device) { FactoryGirl.create(:device) }
    let(:user)   { FactoryGirl.create(:user, device: device) }

    it 'lists points' do
      sign_in user
      FactoryGirl.create_list(:point, 3, device: device)
      get :index
      expect(response.status).to eq(200)
      expect(json.length).to eq(3)
      expect(json.first.keys).to include(:x)
    end
    it 'lists all plants' do
      Point.destroy_all
      plants = 3.times do |num|
        Point.create!(x:       num,
                      y:       num,
                      z:       num,
                      radius:  50,
                      name:    "Cabbage #{num}",
                      device:  user.device,
                      pointer: Plant.new(openfarm_slug: "cabbage"))
      end
      sign_in user
      get :index
      expect(response.status).to eq(200)
      expect(json.length).to eq(3)
    end
    it 'lists all tool slots' do
      Point.destroy_all
      sign_in user
      ts = Point.create(x: 0,
                        y: 0,
                        z: 0,
                        radius: 50,
                        name: "My TS",
                        device: user.device,
                        pointer: ToolSlot.new)
      get :index
      expect(json.first[:id]).to eq(ts.id)
      expect(json.first[:name]).to eq(ts.point.name)
    end
  end
end
