module Api
  # See docs for AbstractConfigController
  class WebAppConfigsController < AbstractConfigController
    KLASS = WebAppConfig
    RELATION_NAME = "web_app_config"

    # WebAppConfig is excluded from row
    def resource
      nil
    end
  end
end
