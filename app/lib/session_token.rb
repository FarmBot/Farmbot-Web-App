# Generates a JSON Web Token (JWT) for a given user. Typically placed in the
# `Authorization` header, or used a password to gain access to the MQTT server.
class SessionToken < AbstractJwtToken
  MUST_VERIFY  = "Verify account first"
  DEFAULT_OS   = "https://api.github.com/repos/" \
                 "farmbot/farmbot_os/releases/latest"
  OS_RELEASE   = ENV.fetch("OS_UPDATE_SERVER") { DEFAULT_OS }
  MQTT         = ENV.fetch("MQTT_HOST")
  # If you are not using the standard MQTT broker (eg: you use a 3rd party
  # MQTT vendor), you will need to change this line.
  MQTT_WS      = ENV.fetch("MQTT_WS") do
    protocol =  ENV["FORCE_SSL"] ? "wss://" : "ws://"
    host     =  ENV.fetch("MQTT_HOST")
    "#{protocol}#{host}:3002/ws"
  end
  EXPIRY       = 40.days
  VHOST        = ENV.fetch("MQTT_VHOST") { "/" }

  def self.issue_to(user,
                    iat: Time.now.to_i,
                    exp: EXPIRY.from_now.to_i,
                    iss: $API_URL,
                    aud: AbstractJwtToken::UNKNOWN_AUD)

    unless user.verified?
      Rollbar.info("Verification Error", email: user.email)
      raise Errors::Forbidden, MUST_VERIFY
    end

    self.new([{ aud:              aud,
                sub:              user.id,
                iat:              iat,
                jti:              SecureRandom.uuid,
                iss:              iss,
                exp:              exp,
                mqtt:             MQTT,
                mqtt_ws:          MQTT_WS,
                os_update_server: OS_RELEASE,
                fw_update_server: "DEPRECATED",
                interim_email:    user.email, # Dont use this for anything ever -RC
                bot:              "device_#{user.device.id}",
                vhost:            VHOST }])
  end

  def self.as_json(user, aud)
    { token: SessionToken.issue_to(user,
      iss:   $API_URL, aud: aud),
      user:  user }
  end
end
