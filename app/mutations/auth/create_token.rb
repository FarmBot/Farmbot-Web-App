module Auth
  class CreateToken < Mutations::Command
    required do
      string :email
      string :password
    end

    def validate
      @user = User.where(email: email.downcase).first
      whoops! unless @user && @user.valid_password?(password)
    end

    def execute
      SessionToken.as_json(@user)
    end

    def whoops!
      add_error :auth, :*, "Bad email or password."
    end
  end
end
