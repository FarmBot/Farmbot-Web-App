module Users
  module PasswordHelpers
    BAD_PASSWORD = "Password does not match"

    def confirm_password(user, password)
      invalid = !user.valid_password?(password)
      add_error :password, :*, BAD_PASSWORD if invalid
    end
  end
end