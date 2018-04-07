require 'spec_helper'

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe '#index' do
    let(:device) { FactoryBot.create(:device) }
    let(:user)  do
      FactoryBot.create(:user, device: device, password: "password123")
    end
    let(:auth_token) do
      params = {email:        user.email,
                password:     "password123",
                fbos_version: Gem::Version.new("999.9.9")}
      Auth::CreateToken.run!(params)[:token].encoded
    end

    it 'lists points' do
      sign_in user
      FactoryBot.create_list(:generic_pointer, 3, device: device)
      get :index
      expect(response.status).to eq(200)
      expect(json.length).to eq(3)
      expect(json.first.keys).to include(:x)
    end
    it 'lists all plants' do
      Point.destroy_all
      plants = 3.times do |num|
        Plant.create!(x:             num,
                      y:             num,
                      z:             num,
                      radius:        50,
                      name:          "Cabbage #{num}",
                      device:        user.device,
                      openfarm_slug: "cabbage",
                      pointer_type:  "Plant",
                      pointer_id:    0)
      end
      sign_in user
      get :index
      expect(response.status).to eq(200)
      expect(json.length).to eq(3)
    end
    it 'lists all tool slots' do
      Point.destroy_all
      sign_in user
      ts =  ToolSlot.create(x:      0,
                            y:      0,
                            z:      0,
                            radius: 50,
                            name:   "My TS",
                            device: user.device)
      get :index
      expect(json.first[:id]).to eq(ts.id)
      expect(json.first[:name]).to eq(ts.name)
    end

    it "handles outdated FBOS" do
      old_last_saw_api = user.device.last_saw_api
      ua = "FARMBOTOS/1.1.1 (RPI3) RPI3 (1.1.1)"
      allow(request).to receive(:user_agent).and_return(ua)
      request.env["HTTP_USER_AGENT"] = ua
      sign_in user
      FactoryBot.create_list(:generic_pointer, 1, device: device)
      get :index
      expect(response.status).to eq(426)
      expect(json[:error]).to include("Upgrade to latest FarmBot OS")
    end

    it "marks device as seen when they download points" do
      old_last_saw_api = user.device.last_saw_api
      ua = "FarmbotOS/5.0.2 (host) host ()"
      allow(request).to receive(:user_agent).and_return(ua)
      request.env["HTTP_USER_AGENT"]   = ua
      request.headers["Authorization"] = "bearer #{auth_token}"
      FactoryBot.create_list(:generic_pointer, 1, device: device)
      get :index
      new_last_saw_api = user.device.reload.last_saw_api
      expect(response.status).to eq(200)
      expect(new_last_saw_api).not_to eq(old_last_saw_api)
    end
  end
end
