require "spec_helper"

describe Api::GuestAccountsController do
  include Devise::Test::ControllerHelpers

  describe "#create" do
    it "creates a guest account", :slow do
      Transport.current.clear!
      secret = SecureRandom.alphanumeric.downcase
      p = { secret: secret }
      run_jobs_now { post :create, body: p.to_json }
      user, secret_again = Transport
        .current
        .calls
        .fetch(:send_guest_token_to)
        .last
      expect(response.status).to eq(200)
      expect(json).to eq({})
      expect(secret_again).to eq(secret)
      expect(user).to be_kind_of(User)
      expect(user.name).to eq("Guest")
      expect(user.email).to include("@farmbot.guest")
      expect(user.agreed_to_terms_at).to be
      expect(user.confirmed_at).to be
    end
  end
end
