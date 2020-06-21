require_relative "../../app/lib/key_gen"

class NewUserReport
  EMAILS = (ENV["CUSTOMER_SUPPORT_SUBSCRIBERS"] || "").split(",").map(&:strip).map(&:trim)
  TPL = <<~HEREDOC
    Below is a list of new FarmBot installations that may
    need a customer support checkin:

    === New device installations today:
    %{daily}

    === New Device installations this week:
    %{weekly}
  HEREDOC

  def new_today
    @new_today ||= User
      .joins(:device)
      .where("devices.last_saw_api > ?", 1.day.ago)
      .pluck(:email)
      .sort
  end

  def new_this_week
    @new_this_week ||= User
      .joins(:device)
      .where("devices.last_saw_api > ?", 7.days.ago)
      .where
      .not(email: new_today)
      .pluck(:email)
      .sort
  end

  def message
    @message ||= TPL % {
      weekly: "",
      daily: "",
    }
  end
end

namespace :new_user_report do
  desc "Send email to customer support with new users for the week / day."
  task run: :environment do
    report = NewUserReport.new
    ActionMailer::Base.mail(
      from: "do-not-reply@farmbot.io",
      to: emails,
      subject: "test",
      body: "test123",
    ).deliver
  end
end
