module PasswordResets
  class Create < Mutations::Command
    required do
      string :email
    end

    def validate
      email_not_found! unless user
    end

    def execute
      send_email
      # Under no circumstance should you return the token.
      return {status: "Check your email!"}
    end

private

    def send_email
      UserMailer.password_reset(user, token).deliver_later
    end

    def token
      @token ||= PasswordResetToken.issue_to(user).encoded
    end

    def email_not_found!
      add_error :email, :not_found, "Email not found"
    end

    def user
      @user ||= User.find_by(email: email)
    end
  end
end
