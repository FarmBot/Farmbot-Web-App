class SessionToken

  def self.missing_env(name)
    raise "You forgot to set ENV['#{ name }']"
  end

  HOST         = Rails.application.routes.default_url_options[:host]
  PORT         = Rails.application.routes.default_url_options[:port]
  EXPIRY       = 40.days
  PRIVATE_KEY  = KeyGen.current
  PUBLIC_KEY   = KeyGen.current.public_key
  ALG          = 'RS256'
  MQTT         = ENV['MQTT_HOST']  || missing_env('MQTT_HOST')
  OS_RELEASE   = ENV['OS_UPDATE_SERVER'] || missing_env('OS_UPDATE_SERVER')
  FW_RELEASE   = ENV['FW_UPDATE_SERVER'] || missing_env('FW_UPDATE_SERVER')

  attr_accessor :encoded, :unencoded
  def initialize(payload)
    @unencoded = payload[0]
    @encoded   = JWT.encode(payload[0], PRIVATE_KEY, ALG)
  end

  def self.decode!(token)
    self.new JWT.decode(token, PUBLIC_KEY, true, algorithm: ALG)
  end

  def self.issue_to(user,
                    iat: Time.now.to_i,
                    exp: EXPIRY.from_now.to_i,
                    iss: "http://#{ HOST }:#{ PORT }")

    self.new([{
             sub:  user.email,
             iat:  iat,
             jti:  SecureRandom.uuid, # TODO: Add ability to revoke.
             iss:  iss,
             exp:  exp,
             mqtt: MQTT,
             os_update_server: OS_RELEASE,
             fw_update_server: FW_RELEASE,
             bot:  user.device.name}])
  end
end
