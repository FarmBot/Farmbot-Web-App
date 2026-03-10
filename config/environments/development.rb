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
  config.enable_reloading = true
  config.consider_all_requests_local = true
  config.eager_load = false
  config.active_record.migration_error = :page_load
  config.active_record.verbose_query_logs = true
  config.active_record.query_log_tags_enabled = true
  config.active_job.verbose_enqueue_logs = true
  config.action_controller.raise_on_missing_callback_actions = true
end
