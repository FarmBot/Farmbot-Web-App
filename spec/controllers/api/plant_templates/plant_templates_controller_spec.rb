require "spec_helper"

describe Api::PlantTemplatesController do
  include Devise::Test::ControllerHelpers

  let(:user) do
    FactoryBot.create(:user)
  end

  let (:saved_garden) do
    FactoryBot.create(:saved_garden, device: user.device)
  end

  let(:plant_templates) do
    FactoryBot.create_list(:plant_template, 3, device: user.device)
  end

  describe "#index" do
    it "shows all plant_templates" do
      sign_in user
      templates_count = plant_templates.count
      get :index
      expect(response.status).to be(200)
      expect(json.length).to be(templates_count)
      this = json.first
      that = PlantTemplate.find(this[:id])
      [:x, :y, :z, :radius, :openfarm_slug].map do |key|
        expect(this[key]).to eq(that[key])
      end
    end
  end

  describe "#create" do
    it "creates a plant template" do
      sign_in user
      b4 = user.device.plant_templates.count
      params = {name:            Faker::Food.vegetables,
                saved_garden_id: saved_garden.id,
                x:               1,
                y:               2,
                z:               3,
                openfarm_slug:   "tomato",
                radius:          32}
      post :create, params: {format: :json}, body: params.to_json
      expect(response.status).to be(200)
      params.map { |(key,value)| expect(json[key]).to eq(value) }
      expect(user.device.plant_templates.count).to be > b4
    end
  end

  describe "#update" do
    it "updates attributes" do
      sign_in user
      plant_template = plant_templates.first
      b4             = plant_template.name
      params         = {name:            Faker::Food.vegetables,
                        x:               9,
                        y:               10,
                        z:               11,
                        openfarm_slug:   "melon",
                        radius:          32}
      put :update,  params: { format: :json, id: plant_template.id },
                    body:   params.to_json
      expect(response.status).to be(200)
      params.map { |(key,value)| expect(json[key]).to eq(value) }
    end

    it "moves stuff from one saved garden to another" do
        sign_in user
        plant_template = plant_templates.first
        b4             = plant_template.saved_garden
        new_garden     = user
                          .device
                          .saved_gardens
                          .where
                          .not(id: b4.id)
                          .first or raise "Opps"
        params         = { saved_garden_id: new_garden.id }
        put :update,  params: { format: :json, id: plant_template.id },
                      body:   params.to_json
        expect(response.status).to be(200)
        expect(json[:saved_garden_id]).to eq(new_garden.id)
    end
  end

  describe "#destroy" do
    it "destroys" do
      sign_in user
      garden = plant_templates.first
      b4     = plant_templates.length
      delete :destroy, params: { id: garden.id }
      expect(response.status).to be(200)
      expect(user.device.plant_templates.count).to be < b4
    end
  end
end
