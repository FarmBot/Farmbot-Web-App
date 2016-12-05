class PasswordResetToken < AbstractJwtToken
  EXPIRY = 24.hours
  AUD    = "PASSWORD_RESETER"

  def self.issue_to(user,
                    iat: Time.now.to_i,
                    exp: EXPIRY.from_now.to_i,
                    iss: $API_URL)

    self.new([{ sub: user.email,
                iat: iat,
                jti: SecureRandom.uuid,
                iss: iss,
                exp: exp,
                aud: AUD }])
  end

  def self.decode!(token)
    self.new(JWT.decode(token,
                        PUBLIC_KEY,
                        true,
                        algorithm: ALG,
                        aud: AUD,
                        verify_aud: true))
  end
end
