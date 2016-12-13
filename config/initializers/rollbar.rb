# NOTE ABOUT THIS FILE

#=================================================+
# PLEASE READ:                                    |
#=================================================+
# FarmBot, Inc. uses Rollbar for error reporting. |
# Rollbar is a proprietary, paid product that     |
# most users would not use on their own servers.  |
# Our eventual plan is to remove this into its    |
# own repo and out of the main app.               |
# TODO: Move this into its own module.            |
#=================================================+
Rollbar.configure do |config|
  config.access_token = ENV['ROLLBAR_ACCESS_TOKEN'] || "NO_ROLLBAR_ACCESS"
  config.enabled = Rails.env.production? ? true : false
  config.person_method = "current_device"

  # Add exception class names to the exception_level_filters hash to
  # change the level that exception is reported at. Note that if an exception
  # has already been reported and logged the level will need to be changed
  # via the rollbar interface.
  # Valid levels: 'critical', 'error', 'warning', 'info', 'debug', 'ignore'
  # 'ignore' will cause the exception to not be reported at all.
  # config.exception_level_filters.merge!('MyCriticalException' => 'critical')
  #
  # You can also specify a callable, which will be called with the exception instance.
  # config.exception_level_filters.merge!('MyCriticalException' => lambda { |e| 'critical' })

  # Enable asynchronous reporting (uses girl_friday or Threading if girl_friday
  # is not installed)
  # config.use_async = true
  # Supply your own async handler:
  # config.async_handler = Proc.new { |payload|
  #  Thread.new { Rollbar.process_from_async_handler(payload) }
  # }

  # Enable asynchronous reporting (using sucker_punch)
  # config.use_sucker_punch

  # Enable delayed reporting (using Sidekiq)
  # config.use_sidekiq
  # You can supply custom Sidekiq options:
  # config.use_sidekiq 'queue' => 'default'

  # If you run your staging application instance in production environment then
  # you'll want to override the environment reported by `Rails.env` with an
  # environment variable like this: `ROLLBAR_ENV=staging`. This is a recommended
  # setup for Heroku. See:
  # https://devcenter.heroku.com/articles/deploying-to-a-custom-rails-environment
  config.environment = $API_URL || ENV['ROLLBAR_ENV'] || Rails.env
end
