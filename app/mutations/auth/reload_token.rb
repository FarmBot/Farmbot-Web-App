module Auth
  # The API supports a number of authentication strategies (Cookies, Bot token,
  # JWT). This service helps determine which auth strategy to use.
  class ReloadToken < Mutations::Command
    required { string :jwt }

    def execute
      # Prevent never ending sessions.
      security_criticial_never_increase_exp = claims["exp"]

      SessionToken.issue_to(user,
        aud: claims["aud"],
        exp: security_criticial_never_increase_exp)

    rescue JWT::DecodeError
      nope
    rescue ActiveRecord::RecordNotFound
      nope
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
