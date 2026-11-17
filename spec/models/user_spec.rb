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

  describe ".env_setting" do
    it "treats a blank value as unset" do
      ClimateControl.modify(TOS_URL: "") do
        expect(User.env_setting("TOS_URL")).to be(nil)
      end
      ClimateControl.modify(TOS_URL: "  ") do
        expect(User.env_setting("TOS_URL")).to be(nil)
      end
    end

    it "returns a value that is set" do
      ClimateControl.modify(TOS_URL: "https://example.com/tos") do
        expect(User.env_setting("TOS_URL")).to eq("https://example.com/tos")
      end
    end
  end

  describe ".env_flag" do
    it "accepts TRUE regardless of case or surrounding whitespace" do
      ["TRUE", "true", "TrUe", " TRUE "].each do |value|
        ClimateControl.modify(NO_EMAILS: value) do
          expect(User.env_flag("NO_EMAILS")).to be(true)
        end
      end
    end

    it "rejects other values, including aliases, blank and unset" do
      ["FALSE", "false", "0", "1", "yes", "YES", "on", "ON",
       "y", "no", "off", "OFF", "", "  ", nil].each do |value|
        ClimateControl.modify(NO_EMAILS: value) do
          expect(User.env_flag("NO_EMAILS")).to be(false)
        end
      end
    end
  end
end
