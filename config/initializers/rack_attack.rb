class Rack::Attack
  ### Throttle Spammy Clients ###
  throttle('req/ip', limit: 1000, period: 1.minutes) do |req|
    req.ip
  end

  ### Stop people from overusing the sync object. ###
  throttle('sync_req/ip', limit: 5, period: 1.minutes) do |req|
    req.ip if req.url.include?("/sync")
  end
end

# Always allow requests from localhost
# (blacklist & throttles are skipped)
Rack::Attack.safelist('allow from localhost') do |req|
  # Requests are allowed if the return value is truthy
  '127.0.0.1' == req.ip || '::1' == req.ip
end
