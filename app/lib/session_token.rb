# Generates a JSON Web Token (JWT) for a given user. Typically placed in the
# `Authorization` header, or used a password to gain access to the MQTT server.
class SessionToken < AbstractJwtToken
  MUST_VERIFY = 'Verify account first'
  DEFAULT_OS = "https://api.github.com/repos/" \
               "farmbot/farmbot_os/releases/latest"
  DEFAULT_FW = "https://api.github.com/repos/FarmBot/farmbot-arduino-firmware/"\
               "releases/latest"
  EXPIRY       = 40.days
  MQTT         = ENV['MQTT_HOST']  || missing_env('MQTT_HOST')
  OS_RELEASE   = ENV['OS_UPDATE_SERVER'] || DEFAULT_OS
  FW_RELEASE   = ENV['FW_UPDATE_SERVER'] || DEFAULT_FW

  def self.issue_to(user,
                    iat: Time.now.to_i,
                    exp: EXPIRY.from_now.to_i,
                    iss: $API_URL)
    raise Errors::Forbidden, MUST_VERIFY unless user.verified?

    self.new([{
             sub:  user.email,
             iat:  iat,
             jti:  SecureRandom.uuid, # TODO: Add ability to revoke.
             iss:  iss,
             exp:  exp,
             mqtt: MQTT,
             os_update_server: OS_RELEASE,
             fw_update_server: FW_RELEASE,
             bot:  "device_#{user.device.id}"}])
  end

  def self.as_json(user)
    {token: SessionToken.issue_to(user, iss: $API_URL), user: user}
  end
end
