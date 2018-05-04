module Api
  # See docs for AbstractConfigController
  class FirmwareConfigsController < AbstractConfigController
    KLASS         = FirmwareConfig
    RELATION_NAME = "firmware_config"
  end
end
