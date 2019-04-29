module Devices
  module Seeders
    module Constants
      SEED_EMAIL = "seed@farmbot.io"

      # Alias these for convinience:
      ANALOG = CeleryScriptSettingsBag::ANALOG
      DIGITAL = CeleryScriptSettingsBag::DIGITAL

      # Fake Enum for product family names
      module Models
        GENESIS = :genesis
        EXPRESS = :express
        NONE = :none
      end

      # Some frequently used constants:
      SOIL_SENSOR = "Soil Sensor"
      TOOL_VERIFICATION = "Tool Verification"
      VACUUM = "Vacuum"
      WATER = "Water"

      # Stub sequences ===========================

      MOUNT_TOOL = {}

      PICK_UP_SEED = {
        kind: "sequences",
        args: {},
        body: [],
      }
    end
  end
end
