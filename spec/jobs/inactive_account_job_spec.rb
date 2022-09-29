require "spec_helper"

describe InactiveAccountJob do
  let!(:yes) do
    user = FactoryBot.create(:user, last_sign_in_at: 3.years.ago)
    tool = FactoryBot.create(:tool, device: user.device)
    user.device.update!(mounted_tool_id: tool.id)
    user
  end
  let!(:no) { FactoryBot.create(:user, last_sign_in_at: 3.days.ago) }
  let!(:not_sure) { FactoryBot.create(:user, last_sign_in_at: nil) }

  it "processes deletion" do
    # === Expect a clean slate.
    expect(not_sure.last_sign_in_at).to be(nil)
    expect(yes.inactivity_warning_sent_at).to be(nil)
    expect(no.inactivity_warning_sent_at).to be(nil)
    empty_mail_bag

    # === Perform the first (only) warning.
    run_jobs_now { InactiveAccountJob.new.perform }
    mail = ActionMailer::Base.deliveries.last

    # === Expect warnings
    expect(yes.reload.inactivity_warning_sent_at).not_to be(nil)
    expect(no.reload.inactivity_warning_sent_at).to be(nil)
    expect(mail).to be_kind_of(Mail::Message)
    expect(mail.to).to include(yes.email)
    subject = "Your FarmBot account will be deleted due to inactivity"
    expect(mail.subject).to include(subject)
    expect(mail.body.encoded).to include("in about 3 years.")
    expect(mail.body.encoded).to include(yes.email)

    # === Wind back the clock to simulate inactivity.
    yes.update!(inactivity_warning_sent_at: 15.days.ago)
    run_jobs_now { InactiveAccountJob.new.perform }
    expect(User.where(id: yes.id).count).to eq(0)
    expect(not_sure.reload.last_sign_in_at).to be
  end
end
