module Auth
  # The API supports a number of authentication strategies (Cookies, Bot token,
  # JWT). This service helps determine which auth strategy to use.
  class FromJWT < Mutations::Command
    required { string :jwt }

    def execute
      token  = SessionToken.decode!(jwt)
      claims = token.unencoded.first
      email  = claims['sub']
      User.find_by(email: email)
    rescue JWT::DecodeError
      add_error :jwt, :decode_error, "JSON Web Token is not valid."
    end
  end
end
