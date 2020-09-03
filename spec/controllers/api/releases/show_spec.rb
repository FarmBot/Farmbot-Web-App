require "spec_helper"

describe Api::ReleasesController do
  include Devise::Test::ControllerHelpers

  describe "#show" do
    it "returns a 422 if no `platform` is provided" do
      get :show, params: {}
      expect(response.status).to eq(422)
      expect(json).to include(error: "A `platform` param is required")
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

      get :show, params: { platform: "rpi3", channel: "stable" }
      expect(response.status).to eq(200)
      expect(json[:id]).to eq(rel_b.id)
      expect(json[:image_url]).to eq(rel_b.image_url)
      expect(json[:version]).to eq(rel_b.version)
    end
  end
end
