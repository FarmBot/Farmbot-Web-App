require 'spec_helper'

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe '#index' do
    let(:device) { FactoryGirl.create(:device) }
    let(:user)  do
      FactoryGirl.create(:user, device: device, password: "password123")
    end
    let(:auth_token) do
      Auth::CreateToken
        .run!(email: user.email, password: "password123")[:token].encoded
    end

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
      expect(json.first[:name]).to eq(ts.name)
    end

    it "handles outdated FBOS" do
      old_last_seen = user.device.last_seen
      ua = "FARMBOTOS/1.1.1 (RPI3) RPI3 (1.1.1)"
      allow(request).to receive(:user_agent).and_return(ua)
      request.env["HTTP_USER_AGENT"] = ua
      sign_in user
      FactoryGirl.create_list(:point, 1, device: device)
      get :index
      expect(response.status).to eq(426)
      expect(json[:error]).to include("Upgrade to latest FarmBot OS")
    end

    it "marks device as seen when they download points" do
      old_last_seen = user.device.last_seen
      ua = "FARMBOTOS/9.8.7 (RPI3) RPI3 (6.5.4)"
      allow(request).to receive(:user_agent).and_return(ua)
      request.env["HTTP_USER_AGENT"]   = ua
      request.headers["Authorization"] = "bearer #{auth_token}"
      FactoryGirl.create_list(:point, 1, device: device)
      get :index
      new_last_seen = user.device.reload.last_seen
      expect(response.status).to eq(200)
      expect(new_last_seen).not_to eq(old_last_seen)
    end
  end
end
