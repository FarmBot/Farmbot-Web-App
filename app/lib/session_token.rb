class SessionToken < AbstractJwtToken

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
end
