# Be sure to restart your server when you modify this file.

# Your secret key is used for verifying the integrity of signed cookies.
# If you change this key, all old signed cookies will become invalid!

# Make sure the secret is at least 30 characters and all random,
# no regular words or you'll be exposed to dictionary attacks.
# You can use `rake secret` to generate a secure secret key.

# Make sure your secret_key_base is kept private
# if you're sharing your code publicly.
if Rails.env == 'production'
  Dss::Application.config.secret_key_base = ENV['secret_key_base']
# else
  # Going to keep a hard coded one here to make life easy for folks who want to
  # run it in development / submit PRs. Less config. RC.
  # Dss::Application.config.secret_key_base = '452b4491c1cdd7315a0d787be2f7668ea'\
  # '8307a64733488151a43b62bdd76a6eb819cf973a9261b1500ef5745faf54171c7015f5ab7fd'\
  # '43449a5e06e6c1215e4e'
end