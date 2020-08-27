require "spec_helper"

describe Api::ReleasesController do
  include Devise::Test::ControllerHelpers

  describe "#show" do
    let(:release) do
      Release.create!(image_url: "gopher://localhost:3000/",
                      version: "99.99.99-rc26",
                      platform: "rpi3",
                      channel: "stable")
    end

    it "returns a 422 if no `platform` is provided" do
      get :show, params: {}
      expect(response.status).to eq(422)
      expect(json).to include(error: "A `platform` param is required")
    end
  end
end
