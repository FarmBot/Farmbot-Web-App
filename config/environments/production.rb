FarmBot::Application.configure do
  config.force_ssl = true if ENV["FORCE_SSL"]
  config.action_controller.perform_caching = true
  config.action_mailer.default_url_options = { host: 'my.farmbot.io' }
  config.active_support.deprecation = :notify
  config.cache_classes = true
  config.consider_all_requests_local       = false
  config.eager_load = true
  config.i18n.fallbacks = true
  config.log_formatter = ::Logger::Formatter.new
  config.log_level = :info
  config.serve_static_files = false
  config.action_mailer.smtp_settings = { address:   'smtp.mandrillapp.com',
                                         port:      587,
                                         user_name: ENV['MANDRILL_USERNAME'],
                                         password:  ENV['MANDRILL_APIKEY'] }
end

