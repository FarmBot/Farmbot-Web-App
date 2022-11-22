require "spec_helper"

describe Api::TokensController do
  include Devise::Test::ControllerHelpers

  describe "#destroy" do
    let(:user) { FactoryBot.create(:user, password: "password") }
    let(:auth_token) do
      SessionToken.issue_to(user, fbos_version: Gem::Version.new("9.9.9"))
    end

    it "destroys a token" do
      request.headers["Authorization"] = "bearer #{auth_token.encoded}"
      get :destroy
      expect(response.status).to eq(204)
    end

    it "denies bad tokens" do
      request.headers["Authorization"] = "bearer nope"
      get :destroy
      expect(response.status).to eq(401)
    end
  end
end
