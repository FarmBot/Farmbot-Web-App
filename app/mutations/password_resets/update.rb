module PasswordResets
  class Update < Mutations::Command
    OLD_TOKEN = "Password reset requests expire after 24 hours. " +
                "You must start the password reset process over again."

    required do
      string :password
      string :password_confirmation
      string :token
    end

    def validate
      valid_password?
    end

    def execute
      user.update!(password: password,
                              password_confirmation: password_confirmation)
      Auth::CreateToken.run!(email: user.email,
                             password: password,
                             fbos_version: Gem::Version.new("999.9.9"),)
    rescue JWT::ExpiredSignature
      add_error :reset, :too_old, OLD_TOKEN
    end

private

    def user
      @user = User.find_by!(email: email)
    end

    def email
      @email ||= reset_token.unencoded["sub"]
    end

    def valid_password?
      length_ok = (password.length > 7)
      pw_match  = password == password_confirmation
      add_error :password,
                :invalid,
                "too short or does not match" unless (length_ok && pw_match)
    end

    def reset_token
      @reset_token ||= PasswordResetToken.decode!(token)
    end
  end
end
