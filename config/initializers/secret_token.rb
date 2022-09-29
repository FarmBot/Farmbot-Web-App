FarmBot::Application.config.secret_key_base = ENV.fetch("SECRET_KEY_BASE") do
  raise "You must set the SECRET_KEY_BASE environment variable."
end
