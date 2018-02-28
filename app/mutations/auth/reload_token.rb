module Auth
  # The API supports a number of authentication strategies (Cookies, Bot token,
  # JWT). This service helps determine which auth strategy to use.
  class ReloadToken < Mutations::Command
    attr_reader :user
    BAD_SUB = "Please log out and try again."

    required do
      string :jwt
      model :fbos_version, class: Gem::Version
    end

    def validate
      @user = User.find_by_email_or_id(claims["sub"])
    end

    def execute
      security_criticial_danger = claims["exp"] # Stop infinite sessions
      token = SessionToken.issue_to(user,
                                    aud:          claims["aud"],
                                    exp:          security_criticial_danger,
                                    fbos_version: fbos_version)
      return { token: token }
    end

    def claims
      @claims ||= SessionToken.decode!(jwt.split(" ").last).unencoded
    end
  end
end
