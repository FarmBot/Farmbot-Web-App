require "spec_helper"

describe Api::SceneObjectsController do
  include Devise::Test::ControllerHelpers

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }
  let(:payload) do
    {
      name: "tomato tray",
      texture: "wood",
      shape: "tray",
      color: "#abc123",
      x_origin: "home",
      y_origin: "max",
      z_origin: "world",
      x_center: 10,
      y_center: 20,
      z_base: 30,
      x_size: 40,
      y_size: 50,
      z_size: 60,
    }
  end

  describe "#index" do
    it "lists scene objects for the current device" do
      sign_in user
      scene_objects = FactoryBot.create_list(:scene_object, 2, device: device)
      FactoryBot.create(:scene_object)

      get :index, params: { format: :json }

      expect(response.status).to eq(200)
      expect(json.map { |x| x[:id] }.sort).to eq(scene_objects.map(&:id).sort)
    end
  end

  describe "#show" do
    it "shows a scene object" do
      sign_in user
      scene_object = FactoryBot.create(:scene_object, device: device)

      get :show, params: { id: scene_object.id, format: :json }

      expect(response.status).to eq(200)
      expect(json[:id]).to eq(scene_object.id)
      expect(json[:name]).to eq(scene_object.name)
    end
  end

  describe "#create" do
    it "creates a scene object" do
      sign_in user
      before = SceneObject.count

      post :create, body: payload.to_json, params: { format: :json }

      expect(response.status).to eq(200)
      expect(SceneObject.count).to eq(before + 1)
      expect(json[:name]).to eq(payload[:name])
      expect(json[:texture]).to eq(payload[:texture])
      expect(SceneObject.last.device).to eq(device)
    end
  end

  describe "#update" do
    it "updates a scene object" do
      sign_in user
      scene_object = FactoryBot.create(:scene_object, device: device)

      put :update,
          body: { name: "new name", x_center: 123 }.to_json,
          params: { id: scene_object.id, format: :json }

      expect(response.status).to eq(200)
      expect(json[:name]).to eq("new name")
      expect(json[:x_center]).to eq(123)
      expect(scene_object.reload.name).to eq("new name")
    end
  end

  describe "#destroy" do
    it "destroys a scene object" do
      sign_in user
      scene_object = FactoryBot.create(:scene_object, device: device)
      id = scene_object.id

      delete :destroy, params: { id: id, format: :json }

      expect(response.status).to eq(200)
      expect(SceneObject.exists?(id)).to be false
    end
  end
end
