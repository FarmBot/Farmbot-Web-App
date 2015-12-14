class SessionToken
  PASSWORD = Rails.application.secrets.secret_key_base
  EXPIRY   = 4.days

  attr_accessor :encoded, :unencoded

  def initialize(payload)
    @unencoded = payload
    @encoded   = JWT.encode(payload, PASSWORD)
  end

  def self.decode!(token)
    self.new JWT.decode(token, PASSWORD)
  end

  def self.issue_to(user, iat = Time.now.to_i, exp = EXPIRY.from_now.to_i)
    # TODO: Add 'iss' claim. doesn't matter right now.
    self.new(email: user.email,        # TODO remove this field and use "sub"
             sub:   user.email,
             iat:   iat,
             jti:   SecureRandom.uuid, # TODO: Add ability to revoke.
             exp:   exp)
  end
end
