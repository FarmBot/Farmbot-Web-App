FarmBot::Application.configure do

  config
    .action_mailer
    .default_url_options = { host: ENV.fetch("API_HOST", "my.farmbot.io") }
  config.active_support.deprecation  = :notify
  config.cache_classes               = true
  config.consider_all_requests_local = false
  config.eager_load                  = true
  config.force_ssl                   = true if ENV["FORCE_SSL"]
  config.i18n.fallbacks              = true
  config.log_formatter               = ::Logger::Formatter.new
  config.log_level                   = :info
  config.perform_caching             = false
  config.public_file_server.enabled  = false
  config.serve_static_assets         = true
  # HACK AHEAD! Here's why:
  # 1. FarmBot Inc. Uses Sendgrid for email.
  # 2. FarmBot is an open source project that must be vendor neutral.
  # 3. Heroku uses non-neutral ENV names like "SENDGRID_PASSWORD"
  # SOLUTION: Support neutral names like "SMTP_HOST",
  #           but fallback to non-neutral var names like "SENDGRID_USERNAME" if
  #           required.
  pw    = ENV['SMTP_PASSWORD'] || ENV['SENDGRID_PASSWORD']
  uname = ENV['SMTP_USERNAME'] || ENV['SENDGRID_USERNAME']

  config.action_mailer.smtp_settings = { port:      ENV.fetch("SMTP_PORT", 587),
                                         address:   ENV['SMTP_HOST'],
                                         user_name: uname,
                                         password:  pw }
end
