class Rack::Attack
  THROTTLE_WARNING = <<~HEREDOC
    IP Temporarily Throttled

    Your IP address has been throttled due to a high number
    of server requests from your web app account or device.

    In most cases, your IP address will be unthrottled after
    a few minutes. If the problem continues, you may request
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
  throttle("demo_accounts/ip", limit: 10, period: 10.minutes) do |req|
    case req.path.downcase
    when "/demo", "/try_farmbot"
      req.ip
    else
      nil
    end
  end

  throttle("password_resets/ip", limit: 3, period: 1.hour) do |req|
    req.ip if req.path.downcase == "api/password_resets"
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
    puts("BLOCKED BY RACK ATTACK: #{req.ip} => #{req.url}")
  end
end

Rack::Attack.throttled_response = lambda do |_req|
  [429, {}, [Rack::Attack::THROTTLE_WARNING]]
end
