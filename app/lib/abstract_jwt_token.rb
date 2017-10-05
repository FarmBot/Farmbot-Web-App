class AbstractJwtToken

  PRIVATE_KEY = KeyGen.current
  PUBLIC_KEY  = KeyGen.current.public_key
  ALG         = 'RS256'
  ALLOWED_AUD = [ BOT_AUD     = "bot",
                  HUMAN_AUD   = "human",
                  UNKNOWN_AUD = "unknown" ]

  attr_accessor :encoded, :unencoded

  def initialize(payload)
    @unencoded = payload[0]
    @encoded   = JWT.encode(payload[0], PRIVATE_KEY, ALG, {typ: "JWT"})
  end

  def self.decode!(token)
    self.new JWT.decode(token, PUBLIC_KEY, true, algorithm: ALG)
  end
end
