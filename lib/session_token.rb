class SessionToken
  PASSWORD = Rails.application.secrets.secret_key_base
  EXPIRY   = 4.days
  ISSUER   = 'farmbot-web-app'

  attr_accessor :encoded, :unencoded

  def initialize(payload)
    @unencoded = payload
    @encoded   = JWT.encode(payload, PASSWORD)
  end

  def self.decode!(token)
    self.new JWT.decode(token, PASSWORD)
  end

  def self.issue_to(user, iat = Time.now.to_i, exp = EXPIRY.from_now.to_i)
    self.new(sub: user.email,
             iat: iat,
             jti: SecureRandom.uuid, # TODO: Add ability to revoke.
             iss: ISSUER,
             exp: exp,
             alg: "RS256")
  end
end
