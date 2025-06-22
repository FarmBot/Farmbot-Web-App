require "spec_helper"

describe User do
  it "prevents accidental deactivation" do
    time = Time.now
    u = FactoryBot.create(:user,
                          last_sign_in_at: time,
                          inactivity_warning_sent_at: time)
    expect(u.inactivity_warning_sent_at).to_not be(nil)
    expect(u.last_sign_in_at).to_not be(time)
    u.deactivate_account
    expect(u.inactivity_warning_sent_at).to be(nil)
    expect(u.last_sign_in_at).to_not be(time)
  end

  describe "#new" do
    it "Creates a new user" do
      expect(User.new).to be_kind_of(User)
    end
  end

  around(:each) do |example|
    original = User::SKIP_EMAIL_VALIDATION
    example.run
    const_reassign(User, :SKIP_EMAIL_VALIDATION, original)
  end

  describe ".refresh_everyones_ui" do
    it "Sends a message over AMQP" do
      get_msg = receive(:raw_amqp_send).with({
        "type" => "reload", "commit" => "NONE",
      }.to_json, Api::RmqUtilsController::PUBLIC_BROADCAST)
      expect(Transport.current).to get_msg
      User.refresh_everyones_ui
    end
  end

  describe "SKIP_EMAIL_VALIDATION" do
    let (:user) { FactoryBot.create(:user, confirmed_at: nil) }

    it "considers all users verified when set to `true`" do
      const_reassign(User, :SKIP_EMAIL_VALIDATION, true)
      expect(user.verified?).to be(true)
    end

    it "does not skip when false" do
      const_reassign(User, :SKIP_EMAIL_VALIDATION, false)
      expect(user.verified?).to be(false)
    end
  end
end
