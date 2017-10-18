class UserMailer < ApplicationMailer
    # Make sure the user gave us a valid email.
    def welcome_email(user)
      @user      = user
      @user_name = user.name
      @the_url   = "http:" + $API_URL + "/verify?token=" + user.confirmation_token
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
      @user    = user
      @the_url = "http:#{$API_URL}/verify?token=#{user.confirmation_token}"
      mail(to: @user.email, subject: 'FarmBot Email Update Instructions')
    end
end
