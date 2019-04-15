class UserMailer < ApplicationMailer
  RESET_PATH         = "http:%s/verify/%s"
  NOTHING_TO_CONFIRM = "FAILED EMAIL CHANGE"
  URI_KLASS          = ENV["FORCE_SSL"] ? URI::HTTP : URI::HTTPS

  # Make sure the user gave us a valid email.
  def welcome_email(user)
    @user      = user
    @user_name = user.name
    @the_url   = UserMailer.reset_url(user)
    mail(to: @user.email, subject: 'Welcome to The FarmBot Web App!')
  end

  def password_reset(user, raw_token)
    @user               = user
    @token              = raw_token
    url                 = UserMailer.url_object
    binding.pry
    @password_reset_url = "?"
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
    puts "CLEAN THIS UP!!"
    x = UserMailer.url_object
    binding.pry # Put the path in here, as in RESET_PATH
    x.to_s
  end

  def self.url_object(host = ENV.fetch("API_HOST"), port = ENV.fetch("API_PORT"))
    output        = {}
    output[:host] = port
    unless [nil, "443", "80"].include?(port)
      output[:port] = port
    end
    output
    URI_KLASS.build(output)
  end
end
