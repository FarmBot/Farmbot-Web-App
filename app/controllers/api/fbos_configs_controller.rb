module Api
  # See docs for AbstractConfigController
  class FbosConfigsController < AbstractConfigController
    KLASS         = FbosConfig
    RELATION_NAME = "fbos_config"
  end
end
