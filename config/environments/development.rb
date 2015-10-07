FarmBot::Application.configure do
  config.action_controller.perform_caching = false
  config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }
  config.active_support.deprecation = :log
  config.assets.debug = true
  config.cache_classes = false
  config.consider_all_requests_local = true
  config.eager_load = false
end
# Whether or not compilation should take place
GulpRails.options[:enabled]   = true
# The command to run
GulpRails.options[:command]   = 'gulp default'
# The directory in which your command should be executed
GulpRails.options[:directory] = Rails.root