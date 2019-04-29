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
      FIXTURE_PATH = "app/mutations/devices/seeders/fixtures.yml"
      SEQUENCES = YAML.load(File.read(FIXTURE_PATH))

      MOUNT_TOOL = SEQUENCES.fetch(:MOUNT_TOOL)
      PICK_UP_SEED_EXPRESS = SEQUENCES.fetch(:PICK_UP_SEED_EXPRESS)
      PICK_UP_SEED_GENESIS = SEQUENCES.fetch(:PICK_UP_SEED_GENESIS)
      PLANT_SEED = SEQUENCES.fetch(:PLANT_SEED)
      TAKE_PHOTO_OF_PLANT = SEQUENCES.fetch(:TAKE_PHOTO_OF_PLANT)
      TOOL_ERROR = SEQUENCES.fetch(:TOOL_ERROR)
      UNMOUNT_TOOL = SEQUENCES.fetch(:UNMOUNT_TOOL)
      WATER_PLANT = SEQUENCES.fetch(:WATER_PLANT)
    end
  end
end
