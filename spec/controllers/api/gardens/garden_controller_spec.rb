require "spec_helper"

describe Api::GardensController do
  include Devise::Test::ControllerHelpers

  let(:user)    { FactoryBot.create(:user) }
  let(:gardens) { FactoryBot.create_list(:garden, 3, device: user.device) }

  describe "#index" do

    it "shows all gardens" do
      sign_in user
      garden_size = gardens.length
      get :index
      expect(response.status).to be(200)
      expect(json.length).to be(garden_size)
      expect(json.first[:name]).to be_kind_of(String)
    end
  end

  describe "#create" do
    it "creates a gardens" do
      sign_in user
      b4 = user.device.gardens.count
      params = { name: Faker::StarWars.call_sign }
      post :create, params: {format: :json}, body: params.to_json
      expect(response.status).to be(200)
      expect(json[:name]).to be_kind_of(String)
      expect(json[:name]).to eq(params[:name])
      expect(user.device.gardens.count).to be > b4
    end
  end

  describe "#update" do
    it "updates attributes" do
      sign_in user
      garden = gardens.first
      b4     = garden.name
      params = { name: Faker::StarWars.call_sign }
      put :update, params: { format: :json, id: garden.id }, body: params.to_json
      expect(response.status).to be(200)
      expect(json[:name]).to_not eq(b4)
      expect(json[:name]).to eq(params[:name])
    end
  end

  describe "#destroy" do
    it "destroys gardens" do
      sign_in user
      garden = gardens.first
      b4     = gardens.length
      delete :destroy, params: { id: garden.id }
      expect(response.status).to be(200)
      expect(user.device.gardens.count).to be < b4
    end
  end
end
