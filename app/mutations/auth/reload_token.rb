module Auth
  # The API supports a number of authentication strategies (Cookies, Bot token,
  # JWT). This service helps determine which auth strategy to use.
  class ReloadToken < Mutations::Command
    BAD_SUB = "Please log out and try again."

    required { string :jwt }

    def execute
      security_criticial_danger = claims["exp"] # Stop infinite sessions
      token = SessionToken.issue_to(user,
                                    aud: claims["aud"],
                                    exp: security_criticial_danger)
      return { token: token }
    rescue User::BadSub
      add_error :user, :bad_sub_claim, BAD_SUB
    end

    def user
      @user ||= User.find_by_email_or_id(claims["sub"])
    end

    def claims
      @claims ||= SessionToken.decode!(jwt.split(" ").last).unencoded
    end

    def nope
      add_error :jwt, :decode_error, "JSON Web Token is not valid."
    end
  end
end
