require 'spec_helper'

describe Api::FarmwareInstallationsController do
  include Devise::Test::ControllerHelpers
  let(:user) { FactoryBot.create(:user) }

  describe '#create' do
    it 'creates a new FarmwareInstallation' do
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

    it "rejects bad URLs"
  end
end
