class InactivityMailer < ApplicationMailer
  attr_reader :user

  SUBJECT = "Your FarmBot account will be deleted "\
  "due to inactivity unless you login"
  ORDER = { 1 => "First", 2 => "Second", 3 => "Final" }

  def send_warning(user)
    @user = user
    mail to: user.email, subject: SUBJECT
  end
end
