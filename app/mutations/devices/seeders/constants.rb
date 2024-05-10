module Devices
  module Seeders
    module Constants
      ANALOG = CeleryScriptSettingsBag::ANALOG
      DIGITAL = CeleryScriptSettingsBag::DIGITAL

      module Names
        EXPRESS = "FarmBot Express"
        EXPRESS_XL = "FarmBot Express XL"
        GENESIS = "FarmBot Genesis"
        GENESIS_XL = "FarmBot Genesis XL"
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
        ROTARY_TOOL = "Rotary Tool"
        ROTARY_TOOL_REVERSE = "Rotary Tool Reverse"
        LIGHTING = "Lighting"
        SEED_TROUGH_1 = "Seed Trough 1"
        SEED_TROUGH_2 = "Seed Trough 2"
      end

      # Stub sequences ===========================
      SEQUENCE_FIXTURE_PATH =
        "app/mutations/devices/seeders/sequence_fixtures.yml"

      module SequenceSeeds
        ALL = YAML.load(File.read(SEQUENCE_FIXTURE_PATH))
        PICK_UP_SEED_EXPRESS = ALL.fetch(:PICK_UP_SEED_EXPRESS)
        PICK_UP_SEED_GENESIS = ALL.fetch(:PICK_UP_SEED_GENESIS)
        PLANT_SEED_GENESIS = ALL.fetch(:PLANT_SEED_GENESIS)
        PLANT_SEED_EXPRESS = ALL.fetch(:PLANT_SEED_EXPRESS)
        TAKE_PHOTO_OF_PLANT = ALL.fetch(:TAKE_PHOTO_OF_PLANT)
        WATER_PLANT = ALL.fetch(:WATER_PLANT)
        WATER_ALL_PLANTS = ALL.fetch(:WATER_ALL_PLANTS)
        FIND_HOME_GENESIS = ALL.fetch(:FIND_HOME_GENESIS)
        FIND_HOME_EXPRESS = ALL.fetch(:FIND_HOME_EXPRESS)
        MOUNT_TOOL = ALL.fetch(:MOUNT_TOOL)
        DISMOUNT_TOOL = ALL.fetch(:DISMOUNT_TOOL)
        DISPENSE_WATER = ALL.fetch(:DISPENSE_WATER)
        SOIL_HEIGHT_GRID = ALL.fetch(:SOIL_HEIGHT_GRID)
        GRID = ALL.fetch(:GRID)
        WATER_ALL = ALL.fetch(:WATER_ALL)
        PHOTO_GRID = ALL.fetch(:PHOTO_GRID)
        WEED_DETECTION_GRID = ALL.fetch(:WEED_DETECTION_GRID)
        MOW_ALL_WEEDS = ALL.fetch(:MOW_ALL_WEEDS)
        PICK_FROM_SEED_TRAY = ALL.fetch(:PICK_FROM_SEED_TRAY)
      end

      module PublicSequenceNames
        DISPENSE_WATER = "Dispense Water"
        SOIL_HEIGHT_GRID = "Soil Height Grid"
        GRID = "Grid"
        WATER_ALL = "Water All"
        PHOTO_GRID = "Photo Grid"
        WEED_DETECTION_GRID = "Weed Detection Grid"
        MOUNT_TOOL = "Mount Tool"
        DISMOUNT_TOOL = "Dismount Tool"
        MOW_ALL_WEEDS = "Mow All Weeds"
        PICK_FROM_SEED_TRAY = "Pick from Seed Tray"
      end
    end
  end
end
