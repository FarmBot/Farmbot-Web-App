require_relative "../../app/lib/key_gen"

class NewUserReport
  EMAILS = (ENV["CUSTOMER_SUPPORT_SUBSCRIBERS"] || "").split(",").map(&:strip)
  TPL = <<~HEREDOC
    Below is a list of new installations that need a support check-in:

    === 24 Hour Active Devices Count:
    %{active}

    === Devices requiring customer service check-in:
    %{dead_bots}

    === New device installations today:
    %{daily}

    === New Device installations this week:
    %{weekly}
  HEREDOC

  def new_today
    @new_today ||= User
      .joins(:device)
      .where("devices.first_saw_api > ?", 1.day.ago)
      .pluck(:email)
      .sort
  end

  def new_this_week
    @new_this_week ||= User
      .joins(:device)
      .where("devices.first_saw_api > ?", 7.days.ago)
      .where
      .not(email: new_today)
      .pluck(:email)
      .sort
  end

  def active_today
    @active_today ||= Device.where("last_saw_api > ?", 1.day.ago).count
  end

  def dead_bots
    @dead_bots ||= Devices::Watchdog.run!().pluck(:email)
  end

  def message
    @message ||= TPL % {
      weekly: new_this_week.join("\n"),
      daily: new_today.join("\n"),
      active: active_today,
      dead_bots: dead_bots.join("\n"),
    }
  end

  def deliver
    puts message
    ActionMailer::Base.mail(
      from: "do-not-reply@#{ENV["API_HOST"]}",
      to: EMAILS,
      subject: "Daily Report: New FarmBot Setups",
      body: message,
    ).deliver
  end
end

namespace :new_user_report do
  desc "Send email to customer support with new users for the week / day."
  task run: :environment do
    report = NewUserReport.new
    report.deliver
  end
end
