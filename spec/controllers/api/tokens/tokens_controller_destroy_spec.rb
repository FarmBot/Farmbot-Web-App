require "spec_helper"

describe Api::TokensController do
  include Devise::Test::ControllerHelpers

  describe "#destroy" do
    let(:user) { FactoryBot.create(:user, password: "password") }
    let(:device) { FactoryBot.create(:device) }
    let(:auth_token) do
      SessionToken.issue_to(user,
                            fbos_version: Gem::Version.new("9.9.9"),
                            iat: Time.now.to_i,
                            exp: 40.days.from_now.to_i)
    end

    it "destroys a token" do
      user.device = device
      request.headers["Authorization"] = "bearer #{auth_token.encoded}"
      delete :destroy
      expect(response.status).to eq(204)
    end

    it "denies bad tokens" do
      request.headers["Authorization"] = "bearer nope"
      delete :destroy
      expect(response.status).to eq(401)
    end
  end
end
