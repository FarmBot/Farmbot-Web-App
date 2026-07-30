require "json"
require "openssl"

class Rack::Attack
  PASSWORD_RESET_BODY_LIMIT = 4096
  PASSWORD_RESET_BODY_THROTTLE = "password_resets/body_size"
  PASSWORD_RESET_HMAC_KEY = Rails.application.key_generator
    .generate_key("password-reset-rate-limit", 32)
  PASSWORD_RESET_IP_LIMIT = 30

  THROTTLE_WARNING = <<~HEREDOC
    Request Temporarily Throttled

    This request has been throttled due to a high number of
    similar server requests.

    In most cases, requests will be allowed again after a few
    minutes. If the problem continues, you may request
    support on the FarmBot forum. Please ensure you are on
    the latest version of FBOS before requesting support.

    Common causes: Syncing a device too often, performing too
    many password resets, writing scripts that download data
    too often.
  HEREDOC

  ### Throttle Spammy Clients ###
  throttle("req/ip", limit: 1000, period: 1.minutes) do |req|
    p = req.path.first(9)
    req.ip unless p == "/api/rmq/"
  end

  # ### Stop people from overusing the sync object. ###
  throttle("sync_req/ip", limit: 15, period: 1.minutes) do |req|
    req.ip if req.url.include?("api/device/sync")
  end

  ### Don't allow too many demo account requests ###
  throttle("demo_accounts/ip", limit: 50, period: 1.hour) do |req|
    case req.path.downcase
    when "/demo", "/try_farmbot"
      req.ip
    else
      nil
    end
  end

  throttle("password_resets/ip",
           limit: PASSWORD_RESET_IP_LIMIT,
           period: 1.hour) do |req|
    req.ip if req.path.downcase == "/api/password_resets"
  end

  def self.password_reset_request?(req)
    req.post? && req.path.downcase == "/api/password_resets"
  end
  private_class_method :password_reset_request?

  def self.password_reset_body(req)
    return unless password_reset_request?(req)

    body = req.body
    body&.read(PASSWORD_RESET_BODY_LIMIT + 1)
  ensure
    body&.rewind
  end
  private_class_method :password_reset_body

  throttle(PASSWORD_RESET_BODY_THROTTLE, limit: 0, period: 1.hour) do |req|
    body = password_reset_body(req)
    req.ip if body && body.bytesize > PASSWORD_RESET_BODY_LIMIT
  end

  def self.password_reset_email(req)
    body = password_reset_body(req)
    return unless body && body.bytesize <= PASSWORD_RESET_BODY_LIMIT

    payload = JSON.parse(body)
    email = payload["email"] if payload.is_a?(Hash)
    return unless email.is_a?(String)

    normalized_email = email.strip.downcase
    return if normalized_email.empty?

    OpenSSL::HMAC.hexdigest(
      "SHA256",
      PASSWORD_RESET_HMAC_KEY,
      normalized_email,
    )
  rescue JSON::ParserError
    nil
  end
  private_class_method :password_reset_email

  throttle("password_resets/email", limit: 3, period: 1.hour) do |req|
    password_reset_email(req)
  end
end

# Always allow requests from localhost
# (excluded & throttles are skipped)
Rack::Attack.safelist("allow from localhost") do |req|
  # Requests are allowed if the return value is truthy
  "127.0.0.1" == req.ip || "::1" == req.ip
end

ActiveSupport::Notifications.subscribe("rack.attack") do |_n, _s, _f, _r, req|
  req = req[:request]
  if %i[throttle blocklist].include?(req.env["rack.attack.match_type"])
    Rails.logger.warn("BLOCKED BY RACK ATTACK: #{req.ip} => #{req.url}")
  end
end

Rack::Attack.throttled_responder = lambda do |req|
  matched = req.env["rack.attack.matched"]
  if matched == Rack::Attack::PASSWORD_RESET_BODY_THROTTLE
    [413, { "content-type" => "text/plain" }, ["Payload Too Large\n"]]
  else
    [429, {}, [Rack::Attack::THROTTLE_WARNING]]
  end
end
