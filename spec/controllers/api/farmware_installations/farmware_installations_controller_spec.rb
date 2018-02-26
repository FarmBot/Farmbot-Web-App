require "spec_helper"

describe Api::FarmwareInstallationsController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }

  describe "#create" do
    it "creates a new FarmwareInstallation" do
      sign_in user
      url = Faker::Internet.url + "/manifest.json"
      payload = { url: url }
      old_installation_count = FarmwareInstallation.count
      post :create, body: payload.to_json, params: {format: :json}
      expect(response.status).to eq(200)
      expect(FarmwareInstallation.count).to be > old_installation_count
      expect(json.keys.sort).to eq([:id, :url])
      expect(json[:url]).to eq(url)
      expect(FarmwareInstallation.find(json[:id]).device).to eq(user.device)
    end

    it "rejects bad URLs" do
      sign_in user
      url = "This is not a valid URL."
      payload = { url: url }
      old_installation_count = FarmwareInstallation.count
      post :create, body: payload.to_json, params: {format: :json}
      expect(response.status).to eq(422)
      expect(FarmwareInstallation.count).to eq(old_installation_count)
      expect(json[:error]).to eq("Validation failed: Url is an invalid URL")
    end
  end

  describe "#index" do
    it "lists all" do
      FactoryBot.create_list(:farmware_installation, 3, device: user.device)
      sign_in user
      get :index
      expect(response.status).to eq(200)
      expect(json.length).to eq(3)
    end
  end

  describe "#destroy" do
    it "destroys a record" do
      sign_in user
      installation = FactoryBot.create(:farmware_installation, device: user.device)
      old_installation_count = FarmwareInstallation.count
      delete :destroy, params: {id: installation.id}
      expect(response.status).to eq(200)
      expect(FarmwareInstallation.count).to be < old_installation_count
    end
  end
end
