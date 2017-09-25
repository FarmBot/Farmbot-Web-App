module Auth
  # The API supports a number of authentication strategies (Cookies, Bot token,
  # JWT). This service helps determine which auth strategy to use.
  class FromJWT < Mutations::Command
    required { string :jwt }

    def execute
      token  = SessionToken.decode!(just_the_token)
      claims = token.unencoded
      sub    = claims["sub"]
      case sub
      when Integer then User.find(sub)
      # HISTORICAL CONTEXT: We once used emails as a `sub` field. At the time,
      # it seemed nice because it was human readable. The problem was that
      # emails are mutable. Under this scheme, changing your email address
      # would invalidate your JWT. Switching it to user_id (that does not
      # change) gets around this issue. We still need to support emails in
      # JWTs, atleast for another month or so because it would invalidate
      # existing tokens otherwise.
      # TODO: Only use user_id (not email) for validation after 25 OCT 17 - RC
      when String then User.find_by!(email: sub)
      else raise "SUB was neither string nor number"
      end
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
