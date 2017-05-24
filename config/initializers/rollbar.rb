#=================================================+
# PLEASE READ:                                    |
#=================================================+
# FarmBot, Inc. uses Rollbar for error reporting. |
# Rollbar is a proprietary, paid product that     |
# most users would not use on their own servers.  |
# Our eventual plan is to remove this into its    |
# own repo and out of the main app.               |
#=================================================+
Rollbar.configure do |config|
  config.access_token = ENV['ROLLBAR_ACCESS_TOKEN'] || "NO_ROLLBAR_ACCESS"
  config.enabled = Rails.env.production? ? true : false
  config.person_method = "current_device"
  config.environment = $API_URL || ENV['ROLLBAR_ENV'] || Rails.env
end
