FarmBot::Application.configure do
  config.action_controller.allow_forgery_protection = false
  config.action_controller.perform_caching          = false
  config.action_dispatch.show_exceptions            = false
  config.action_mailer.delivery_method              = :test
  config.active_job.queue_adapter                   = :inline
  config.active_support.deprecation                 = :stderr
  config.assets.debug                               = true
  config.cache_classes                              = true
  config.consider_all_requests_local                = true
  config.eager_load                                 = true
  config.log_level                                  = :error
  config.public_file_server.enabled                 = true
  config.public_file_server.headers                 = \
    { 'Cache-Control' => 'public, max-age=3600' }
  config.after_initialize do
    Bullet.enable        = true
    Bullet.bullet_logger = true
    Bullet.raise         = true
  end
end
