require "spec_helper"

describe Api::ReleasesController do
  include Devise::Test::ControllerHelpers

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  describe "#show" do
    it "returns a 422 if no `platform` is provided" do
      sign_in user
      get :show, params: {}
      expect(response.status).to eq(422)
      expect(json).to include(platform: "Platform can't be nil")
    end

    it "returns a 422 when device is already up-to-date" do
      Release.destroy_all
      Release.create!(image_url: "gopher://localhost:3000/a",
                      version: "1.2.3-rc6",
                      platform: "rpi3",
                      channel: "stable")
      device.update!(fbos_version: "1.2.3-rc6")
      sign_in user
      get :show, params: { platform: "rpi3" }
      expect(response.status).to eq(422)
      expect(json).to include(version: "Already on the latest version.")
    end

    it "grabs the most recent release" do
      Release.destroy_all
      rel_a = Release.create!(image_url: "gopher://localhost:3000/a",
                              version: "1.2.3-rc6",
                              platform: "rpi3",
                              channel: "stable")
      rel_b = Release.create!(image_url: "gopher://localhost:3000/b",
                              version: "1.2.3-rc7",
                              platform: "rpi3",
                              channel: "stable")

      sign_in user
      get :show, params: { platform: "rpi3", channel: "stable" }
      expect(response.status).to eq(200)
      expect(json[:id]).to eq(rel_b.id)
      expect(json[:image_url]).to eq(rel_b.image_url)
      expect(json[:version]).to eq(rel_b.version)
    end
  end
end
