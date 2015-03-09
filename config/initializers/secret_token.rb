# Fake key for non-production ENVs
key = '78d21d901ba79defae9ddf6359eb70c6d8203f7ea7eec3e8f3e3791c6b1fe04a'\
      '5b0313f149b2b81dd108aae49254dd2b905c00f863e1923916dbac70bba63134'
# Real key for production.
key = ENV['SECRET_KEY_BASE'] if Rails.env == 'production'

FarmBot::Application
  .config
  .secret_key_base = key
