module Auth
  class CreateToken < Mutations::Command
    required do
      string :email
      string :password
      # TODO: Rename all occurences to "URL".
      # This is not truly a host, as it has a protocol and port associatied with it.
      string :host
    end

    def validate
      @user = User.where(email: email).first
      whoops! unless @user && @user.valid_password?(password)
    end

    def execute
      {token: SessionToken.issue_to(@user, iss: host), user: @user}
    end

    def whoops!
      add_error :auth, :*, "Bad email or password."
    end
  end
end
