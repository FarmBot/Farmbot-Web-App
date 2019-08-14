require "spec_helper"

describe Api::FirstPartyFarmwaresController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }

  describe "#index" do
    it "lists all" do
      sign_in user
      get :index
      expect(response.status).to eq(200)
      expect(json.length).to eq(Api::FirstPartyFarmwaresController::STUBS.length)
    end
  end

  describe "#show" do
    it "lists one" do
      sign_in user
      get :show, params: { id: 2 }
      expect(response.status).to eq(200)
      expect(json[:id]).to eq(Api::FirstPartyFarmwaresController::STUBS.dig(2.to_s, :id))
    end
  end
end
