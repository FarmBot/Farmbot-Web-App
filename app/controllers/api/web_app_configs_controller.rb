module Api
  # See docs for AbstractConfigController
  class WebAppConfigsController < AbstractConfigController
    KLASS         = WebAppConfig
    RELATION_NAME = "web_app_config"
  end
end
