class SessionToken
  EXPIRY       = 4.days
  PRIVATE_KEY  = KeyGen.current
  PUBLIC_KEY   = KeyGen.current.public_key
  ALG          = 'RS256'
  MQTT         = ENV['MQTT_URL'] || "localhost" # my.farmbot.io

  attr_accessor :encoded, :unencoded

  def initialize(payload)
    @unencoded = payload
    @encoded   = JWT.encode(payload, PRIVATE_KEY, ALG)
  end

  def self.decode!(token)
    self.new JWT.decode(token, PUBLIC_KEY, true, algorithm: ALG)
  end

  def self.issue_to(user,
                    iat: Time.now.to_i,
                    exp: EXPIRY.from_now.to_i,
                    iss: "http://localhost:3000")
    self.new(sub:  user.email,
             iat:  iat,
             jti:  SecureRandom.uuid, # TODO: Add ability to revoke.
             iss:  iss,
             exp:  exp,
             mqtt: MQTT)
  end
end
