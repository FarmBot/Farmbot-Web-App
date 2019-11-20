class InactivityMailer < ApplicationMailer
  attr_reader :user

  SUBJECT = "Your FarmBot Account Will Be Deleted Due to Inactivity"
  ORDER = { 1 => "First", 2 => "Second", 3 => "Final" }

  def send_warning(user)
    @user = user
    mail to: user.email, subject: SUBJECT
  end
end
