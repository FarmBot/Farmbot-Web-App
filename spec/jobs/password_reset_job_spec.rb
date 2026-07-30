require "spec_helper"

describe PasswordResetJob do
  it "sends a password reset email to a registered user" do
    user = FactoryBot.create(:user)

    expect {
      PasswordResetJob.new.perform(" #{user.email.upcase} ")
    }.to change { ActionMailer::Base.deliveries.length }.by(1)

    expect(last_email.to).to include(user.email)
    expect(last_email.to_s).to include("password reset")
  end

  it "does not send email for an unregistered address" do
    expect {
      PasswordResetJob.new.perform("unknown@example.com")
    }.not_to change { ActionMailer::Base.deliveries.length }
  end

  it "delegates delivery to a mailer job" do
    user = FactoryBot.create(:user)
    token = instance_double(PasswordResetToken, encoded: "encoded-token")
    delivery = instance_double(ActionMailer::MessageDelivery)
    allow(PasswordResetToken).to receive(:issue_to).and_return(token)
    allow(UserMailer).to receive(:password_reset).and_return(delivery)
    expect(delivery).to receive(:deliver_later)

    PasswordResetJob.new.perform(user.email)
  end
end
