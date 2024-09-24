require "spec_helper"

describe Api::PointsController do
  include Devise::Test::ControllerHelpers
  describe "#index" do
    let(:device) { FactoryBot.create(:device) }
    let(:user) do
      FactoryBot.create(:user, device: device, password: "password123")
    end
    let(:auth_token) do
      params = { email: user.email,
                 password: "password123",
                 fbos_version: Gem::Version.new("999.9.9") }
      Auth::CreateToken.run!(params)[:token].encoded
    end

    it "shows only discarded points" do
      Point.destroy_all
      old = Plant.create!(x: 5,
                          y: 5,
                          z: 5,
                          radius: 50,
                          name: "old",
                          device: user.device,
                          openfarm_slug: "cabbage",
                          pointer_type: "Plant",
                          discarded_at: Time.now)

      Plant.create!(x: 5,
                    y: 5,
                    z: 5,
                    radius: 50,
                    name: "new",
                    device: user.device,
                    openfarm_slug: "cabbage",
                    pointer_type: "Plant",
                    discarded_at: nil)
      sign_in user
      get :index, params: { filter: "old" }
      expect(response.status).to eq(200)
      expect(json.length).to eq(1)
      expect(json.first[:name]).to eq("old")
    end

    it "shows active points by default" do
      Point.destroy_all
      old = Plant.create!(x: 5,
                          y: 5,
                          z: 5,
                          radius: 50,
                          name: "old",
                          device: user.device,
                          openfarm_slug: "cabbage",
                          pointer_type: "Plant",
                          discarded_at: Time.now)

      Plant.create!(x: 5,
                    y: 5,
                    z: 5,
                    radius: 50,
                    name: "new",
                    device: user.device,
                    openfarm_slug: "cabbage",
                    pointer_type: "Plant",
                    discarded_at: nil)
      sign_in user
      get :index, params: {}
      expect(response.status).to eq(200)
      expect(json.length).to eq(1)
      expect(json.first[:name]).to eq("new")
    end

    it "shows `discarded` and `kept` points" do
      Point.destroy_all
      old = Plant.create!(x: 5,
                          y: 5,
                          z: 5,
                          radius: 50,
                          name: "old",
                          device: user.device,
                          openfarm_slug: "cabbage",
                          pointer_type: "Plant",
                          discarded_at: Time.now)

      Plant.create!(x: 5,
                    y: 5,
                    z: 5,
                    radius: 50,
                    name: "new",
                    device: user.device,
                    openfarm_slug: "cabbage",
                    pointer_type: "Plant",
                    discarded_at: nil)
      sign_in user
      get :index, params: { filter: "all" }
      expect(response.status).to eq(200)
      expect(json.length).to eq(2)
      expect(json.pluck(:name)).to include("old")
      expect(json.pluck(:name)).to include("new")
    end

    it "lists non-discarded (active) points" do
      sign_in user
      FactoryBot.create_list(:generic_pointer, 3, device: device)
      get :index
      expect(response.status).to eq(200)
      expect(json.length).to eq(3)
      expect(json.first.keys).to include(:x)
    end
    it "lists all plants" do
      Point.destroy_all
      plants = 3.times do |num|
        Plant.create!(x: num,
                      y: num,
                      z: num,
                      radius: 50,
                      name: "Cabbage #{num}",
                      device: user.device,
                      openfarm_slug: "cabbage",
                      pointer_type: "Plant")
      end
      sign_in user
      get :index
      expect(response.status).to eq(200)
      expect(json.length).to eq(3)
    end
    it "lists all tool slots" do
      Point.destroy_all
      sign_in user
      ts = ToolSlot.create!(x: 0,
                            y: 0,
                            z: 0,
                            radius: 50,
                            name: "My TS",
                            device: user.device,
                            pointer_type: "ToolSlot")
      get :index
      expect(json.first[:id]).to eq(ts.id)
      expect(json.first[:name]).to eq(ts.name)
    end

    it "handles outdated FBOS" do
      old_last_saw_api = user.device.last_saw_api
      simulate_fbos_request("1.1.1")
      sign_in user
      FactoryBot.create_list(:generic_pointer, 1, device: device)
      get :index
      expect(response.status).to eq(426)
      expect(json[:error]).to include("Upgrade to latest FarmBot OS")
    end

    it "marks device as seen when they download points" do
      old_last_saw_api = user.device.last_saw_api
      simulate_fbos_request
      request.headers["Authorization"] = "bearer #{auth_token}"
      FactoryBot.create_list(:generic_pointer, 1, device: device)
      get :index
      new_last_saw_api = user.device.reload.last_saw_api
      expect(response.status).to eq(200)
      expect(new_last_saw_api).not_to eq(old_last_saw_api)
    end
  end
end
