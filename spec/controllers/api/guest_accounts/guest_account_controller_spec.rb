require "spec_helper"

describe Api::GuestAccountsController do
  include Devise::Test::ControllerHelpers
  # Klass = Api::GuestAccountsController::CreateGuest

  describe "#create" do
    it "creates a guest account", :slow do
      Device.all.map do |d|
        Devices::Destroy.run!(user: d.users.first, device: d)
      end
      secret = SecureRandom.alphanumeric.downcase
      p = { secret: secret }
      get_msg = receive(:raw_amqp_send).with("", "guest_registry.#{secret}")
      expect(Transport.current).to get_msg

      run_jobs_now do
        post :create, body: p.to_json, params: { format: :json }
      end

      expect(response.status).to eq(200)
    end
  end
end
