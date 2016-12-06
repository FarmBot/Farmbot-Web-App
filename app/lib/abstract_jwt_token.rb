class AbstractJwtToken

  def self.missing_env(name)
    raise "You forgot to set ENV['#{ name }']"
  end

  PRIVATE_KEY  = KeyGen.current
  PUBLIC_KEY   = KeyGen.current.public_key
  ALG          = 'RS256'

  attr_accessor :encoded, :unencoded

  def initialize(payload)
    @unencoded = payload[0]
    @encoded   = JWT.encode(payload[0], PRIVATE_KEY, ALG)
  end

  def self.decode!(token)
    self.new JWT.decode(token, PUBLIC_KEY, true, algorithm: ALG)
  end
end
