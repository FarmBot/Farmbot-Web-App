class UserMailer < ApplicationMailer
    def welcome_email(user)
      @user = user
      mail(to: @user.email, subject: 'Welcome to The FarmBot Web App!')
    end

    def password_reset(user, raw_token)
      @user  = user
      @token = raw_token
      mail(to: @user.email, subject: 'FarmBot Password Reset Instructions')
    end
end
