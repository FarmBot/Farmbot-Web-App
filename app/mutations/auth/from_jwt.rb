module Auth
  # The API supports a number of authentication strategies (Cookies, Bot token,
  # JWT). This service helps determine which auth strategy to use.
  class FromJWT < Mutations::Command
    required { string :jwt }

    def execute
      token  = SessionToken.decode!(just_the_token)
      claims = token.unencoded
      email  = claims['sub']
      User.find_by(email: email)
    rescue JWT::DecodeError
      add_error :jwt, :decode_error, "JSON Web Token is not valid."
    end

    def just_the_token
      # Token auth requires the `authorization` header to be in the format of:
      # "Authorization: Bearer <INSERT_TOKEN_HERE>"
      # This helper method strips out the use "Bearer " text from a token, if it
      # managed to sneak in.
      jwt.split(" ").last
    end
  end
end
