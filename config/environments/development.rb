require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.action_controller.perform_caching = false
  config.action_mailer.default_url_options = {
    host: Rails.application.routes.default_url_options[:host],
    port: Rails.application.routes.default_url_options[:port],
  }
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    address: ENV.fetch("API_HOST"),
    port: 1025,
  }
  config.active_support.deprecation = :log
  # config.assets.debug = true
  # config.assets.digest = true
  # config.assets.raise_runtime_errors = true
  config.cache_classes = false
  config.consider_all_requests_local = true
  config.eager_load = false
  config.active_record.migration_error = :page_load
  config.active_record.verbose_query_logs = true
end
