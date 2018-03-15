class UserMailer < ApplicationMailer
  RESET_PATH         = "http:%s/verify/%s"
  NOTHING_TO_CONFIRM = "FAILED EMAIL CHANGE"
  # Make sure the user gave us a valid email.
  def welcome_email(user)
    @user      = user
    @user_name = user.name
    @the_url   = UserMailer.reset_url(user)
    mail(to: @user.email, subject: 'Welcome to The FarmBot Web App!')
  end

  def password_reset(user, raw_token)
    @user  = user
    @token = raw_token
    @host  = $API_URL
    mail(to: @user.email, subject: 'FarmBot Password Reset Instructions')
  end

  # Much like welcome_email, it is used to check email validity.
  # Triggered after the user tries update the `email` attr in Users#update.
  def email_update(user)
    raise NOTHING_TO_CONFIRM unless user.unconfirmed_email.present?
    @user    = user
    @the_url = UserMailer.reset_url(user)

    mail(to:      @user.unconfirmed_email,
         subject: 'FarmBot Email Update Instructions')
  end

  def self.reset_url(user)
    x = URI(RESET_PATH % [$API_URL, user.confirmation_token])
    (x.port = nil) if (x.port === 443) # Sendgrid does not like :443 in URLs.
    x.to_s
  end
end
