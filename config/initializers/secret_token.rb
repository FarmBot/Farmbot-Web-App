FarmBot::Application.config.secret_key_base = ENV.fetch("SECRET_KEY_BASE") do
  # TODO: Remove in December 2019 - RC
  puts <<~HEREDOC
         WARNING: Your app is using the default secret key,
         which is NOT suitable for publicly accessible servers.
       HEREDOC

  [
    "78d21d901ba79defae9ddf6359eb7",
    "0c6d8203f7ea7eec3e8f3e3791c6b",
    "1fe04a5b0313f149b2b81dd108aae",
    "49254dd2b905c00f863e1923916db",
    "ac70bba63134",
  ].join("")
end
