module Devices
  module Seeders
    module Constants
      # I alias these for convinience:
      ANALOG = CeleryScriptSettingsBag::ANALOG
      DIGITAL = CeleryScriptSettingsBag::DIGITAL

      module Names
        EXPRESS = "FarmBot Express"
        EXPRESS_XL = "FarmBot Express XL"
        GENESIS = "FarmBot Genesis"
        GENESIS_XL = "FarmBot Genesis XL"
      end

      module ProductLines
        GENESIS = :genesis
        EXPRESS = :express
        NONE = :none
      end

      module ToolNames
        SEED_BIN = "Seed Bin"
        SEED_TRAY = "Seed Tray"
        SEEDER = "Seeder"
        SOIL_SENSOR = "Soil Sensor"
        TOOL_VERIFICATION = "Tool Verification"
        VACUUM = "Vacuum"
        WATER = "Water"
        WATERING_NOZZLE = "Watering Nozzle"
        WEEDER = "Weeder"
        LIGHTING = "Lighting"
        SEED_TROUGH_1 = "Seed Trough 1"
        SEED_TROUGH_2 = "Seed Trough 2"
        SEED_TROUGH_3 = "Seed Trough 3"
      end

      # Stub plants ==============================
      PLANT_FIXTURE_PATH =
        "app/mutations/devices/seeders/plant_fixtures.yml"
      PLANTS = YAML.load(File.read(PLANT_FIXTURE_PATH))

      # Stub sequences ===========================
      SEQUENCE_FIXTURE_PATH =
        "app/mutations/devices/seeders/sequence_fixtures.yml"

      module SequenceSeeds
        ALL = YAML.load(File.read(SEQUENCE_FIXTURE_PATH))
        MOUNT_TOOL = ALL.fetch(:MOUNT_TOOL)
        PICK_UP_SEED_EXPRESS = ALL.fetch(:PICK_UP_SEED_EXPRESS)
        PICK_UP_SEED_GENESIS = ALL.fetch(:PICK_UP_SEED_GENESIS)
        PLANT_SEED = ALL.fetch(:PLANT_SEED)
        TAKE_PHOTO_OF_PLANT = ALL.fetch(:TAKE_PHOTO_OF_PLANT)
        TOOL_ERROR = ALL.fetch(:TOOL_ERROR)
        UNMOUNT_TOOL = ALL.fetch(:UNMOUNT_TOOL)
        WATER_PLANT = ALL.fetch(:WATER_PLANT)
      end
    end
  end
end
