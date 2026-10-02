require "spec_helper"

describe Api::DemoAccountsController do
  include Devise::Test::ControllerHelpers

  describe "#create" do
    it "passes forced fallback through queued demo seeding", :slow do
      Transport.current.clear!
      expect(SequenceVersion).not_to receive(:publicly_available)
      expect(Sequences::Install).not_to receive(:run!)
      expect(Rollbar).not_to receive(:error)
      params = {
        secret: SecureRandom.alphanumeric.downcase,
        product_line: "genesis_1.8",
        force_fallback_install: true,
      }

      run_jobs_now { post :create, body: params.to_json }

      expect(response.status).to eq(200)
      user = Transport.current.calls.fetch(:send_demo_token_to).last.first
      names = Devices::Seeders::Constants::PublicSequenceNames
      [names::GRID, names::MOUNT_TOOL, names::MOW_ALL_WEEDS].each do |name|
        sequence = user.device.sequences.find_by!(name: name)
        expect(sequence.sequence_version_id).to be_nil
        expect(Sequences::Show.run!(sequence: sequence).fetch(:body)).not_to be_empty
      end
      expect(user.device.reload.account_seeded_at).to be_present
    end

    it "creates a guest account", :slow do
      Transport.current.clear!
      secret = SecureRandom.alphanumeric.downcase
      p = { secret: secret, product_line: "genesis_1.7" }
      run_jobs_now { post :create, body: p.to_json }
      user, secret_again = Transport
        .current
        .calls
        .fetch(:send_demo_token_to)
        .last
      expect(response.status).to eq(200)
      expect(json).to eq({})
      expect(secret_again).to eq(secret)
      expect(user).to be_kind_of(User)
      expect(user.name).to eq("Guest")
      expect(user.email).to include("@farmbot.guest")
      expect(user.agreed_to_terms_at).to be
      expect(user.confirmed_at).to be
      discard_unsaved = user
        .device
        .web_app_config
        .discard_unsaved
      expect(discard_unsaved).to be(true)
      version = user.device.fbos_version
      expect(version).to eq("100.0.0")
    end
  end
end
