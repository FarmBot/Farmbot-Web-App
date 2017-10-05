module Auth
  # The API supports a number of authentication strategies (Cookies, Bot token,
  # JWT). This service helps determine which auth strategy to use.
  class ReloadToken < Mutations::Command
    required { string :jwt }

    def execute
      # Prevent never ending sessions.
      security_criticial_danger = claims["exp"]
      token = SessionToken.issue_to(user,
                                    aud: claims["aud"],
                                    exp: security_criticial_danger)
      return { token: token }
    end

    def claims
      @claims ||= SessionToken.decode!(jwt.split(" ").last).unencoded
    end

    def user
      @user ||= User.find(claims["sub"])
    end

    def nope
      add_error :jwt, :decode_error, "JSON Web Token is not valid."
    end
  end
end
