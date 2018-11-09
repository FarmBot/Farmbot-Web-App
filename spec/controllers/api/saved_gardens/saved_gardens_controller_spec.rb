require "spec_helper"

describe Api::SavedGardensController do
  include Devise::Test::ControllerHelpers

  let(:user)    { FactoryBot.create(:user) }
  let(:saved_gardens) { FactoryBot.create_list(:saved_garden, 3, device: user.device) }

  describe "#index" do

    it "shows all saved_gardens" do
      sign_in user
      garden_size = saved_gardens.length
      get :index
      expect(response.status).to be(200)
      expect(json.length).to be(garden_size)
      expect(json.first[:name]).to be_kind_of(String)
    end
  end

  describe "#create" do
    it "creates a saved_gardens" do
      sign_in user
      b4 = user.device.saved_gardens.count
      params = { name: Faker::Food.vegetables }
      post :create, params: {format: :json}, body: params.to_json
      expect(response.status).to be(200)
      expect(json[:name]).to be_kind_of(String)
      expect(json[:name]).to eq(params[:name])
      expect(user.device.saved_gardens.count).to be > b4
    end
  end

  describe "#update" do
    it "updates attributes" do
      sign_in user
      garden = saved_gardens.first
      b4     = garden.name
      params = { name: Faker::Food.vegetables }
      put :update, params: { format: :json, id: garden.id }, body: params.to_json
      expect(response.status).to be(200)
      expect(json[:name]).to_not eq(b4)
      expect(json[:name]).to eq(params[:name])
    end
  end

  describe "#destroy" do
    it "destroys saved_gardens" do
      sign_in user
      garden = saved_gardens.first
      b4     = saved_gardens.length
      delete :destroy, params: { id: garden.id }
      expect(response.status).to be(200)
      expect(user.device.saved_gardens.count).to be < b4
    end
  end

  describe "#snapshot" do
    it "creates a saved garden from an existing garden" do
      SavedGarden.destroy_all
      PlantTemplate.destroy_all
      sign_in user
      gardens_b4   = user.device.saved_gardens.count
      templates_b4 = user.device.plant_templates.count
      plants = FactoryBot.create_list(:plant, 3, device: user.device)
      post :snapshot
      expect(response.status).to be(200)
      expect(user.device.plant_templates.count).to eq(plants.length)
      expect(user.device.saved_gardens.count).to be > gardens_b4
      expect(user.device.plant_templates.count).to be > templates_b4
    end
  end

  describe "#apply" do
    it "converts plant templates to real plants" do
      SavedGarden.destroy_all
      Plant.destroy_all
      PlantTemplate.destroy_all
      sign_in user
      # Create a garden
      saved_garden = FactoryBot.create(:saved_garden, device: user.device)
      FactoryBot.create_list(:plant_template, 3, device: user.device, saved_garden: saved_garden)
      old_plant_count = user.device.plants.count
      patch :apply, params: {id: saved_garden.id }
      expect(response.status).to be(200)
      expect(user.device.plants.count).to be > old_plant_count
    end

    it "prevents destructive application when plants in use." do
      SavedGarden.destroy_all
      Plant.destroy_all
      PlantTemplate.destroy_all
      sign_in user
      saved_garden = FactoryBot.create(:saved_garden, device: user.device)
      FactoryBot.create_list(:plant_template, 3, device: user.device,
                                                 saved_garden: saved_garden)
      plant = FactoryBot.create(:plant, device: user.device)
      FakeSequence.create(device: user.device,
        body: [{ kind: "move_absolute",
                args: {
                  location: {
                    kind: "point",
                    args: { pointer_type: "Plant", pointer_id: plant.id }
                  },
                  speed: 100,
                  offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } }
                }
              }])

      old_plant_count = user.device.plants.count
      post :apply, params: {id: saved_garden.id }
      expect(response.status).to be(422)
      expect(user.device.plants.count).to eq(old_plant_count)
      expect(json[:whoops])
        .to include("Unable to remove the following plants from the garden")
      expect(json[:whoops])
        .to include("plant at (#{plant.x}, #{plant.y}, #{plant.z})")
    end

    it "performs 'destructive' garden application" do
      SavedGarden.destroy_all
      Plant.destroy_all
      PlantTemplate.destroy_all
      sign_in user
      saved_garden = FactoryBot.create(:saved_garden, device: user.device)
      plant        = FactoryBot.create(:plant, device: user.device)
      FactoryBot.create_list(:plant_template, 3, device: user.device, saved_garden: saved_garden)
      old_plant_count = user.device.plants.count
      post :apply, params: {id: saved_garden.id }
      expect(response.status).to be(200)
      expect(user.device.plants.count).to be > old_plant_count
      expect(Plant.exists?(plant.id)).to be false
    end
  end
end
