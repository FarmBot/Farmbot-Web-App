module Auth
  class CreateToken < Mutations::Command
    required do
      string :email
      string :password
      string :host
    end

    def validate
      @user = User.where(email: email).first
      whoops! unless @user && @user.valid_password?(password)
    end

    def execute
      {token: SessionToken.issue_to(@user, iss: host)}
    end

    def whoops!
      add_error :auth, :*, "Bad email or password."
    end
  end
end
