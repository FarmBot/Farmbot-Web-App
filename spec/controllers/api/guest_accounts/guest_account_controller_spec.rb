require "spec_helper"

describe Api::GuestAccountsController do
  include Devise::Test::ControllerHelpers

  describe "#create" do
    it "creates a guest account", :slow do
      Transport.current.connection.clear!
      # Device.all.map do |d|
      #   user = d.users.first
      #   Devices::Destroy.run!(user: user, device: d) if user
      # end
      secret = SecureRandom.alphanumeric.downcase
      p = { secret: secret }
      run_jobs_now { post :create, body: p.to_json }
      routing_key =
        [Api::RmqUtilsController::GUEST_REGISTRY_ROOT, secret].join(".")
      last_call = Transport
        .current
        .calls
        .fetch(:raw_amqp_send)
        .find { |x| x.include?(routing_key) }
      expect(last_call).to be
      expect(response.status).to eq(200)
      expect(json).to eq({})
      expect(last_call[1]).to eq(routing_key)
      jwt = JSON.parse(last_call[0], symbolize_names: true)
      expect(jwt).to be_kind_of(Hash)
      expect(jwt.keys).to include(:token, :user)
      result_dev = Device.find(jwt.dig(:token, :unencoded, :sub))
      result_usr = result_dev.users.first
      expect(result_usr.name).to eq("Guest")
      expect(result_usr.email).to include("@farmbot.guest")
      expect(result_usr.agreed_to_terms_at).to be
      expect(result_usr.confirmed_at).to be
    end
  end
end
