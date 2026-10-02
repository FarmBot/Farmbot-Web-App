module Devices
  module Seeders
    module Constants
      ANALOG = CeleryScriptSettingsBag::ANALOG
      DIGITAL = CeleryScriptSettingsBag::DIGITAL

      TOOL_X = 6
      TOOL_Y = 100
      TOOL_Z = -340
      TOOL_SPACING = 100

      TROUGH_Y = 0
      TROUGH_Z = -300
      TROUGH_SPACING = 25

      module MountStage
        NONE = 0
        X = 1
        Y = 2
        Z = 3
      end

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
        PERIPHERAL_4 = "Peripheral 4"
        PERIPHERAL_5 = "Peripheral 5"
        SEED_TROUGH_1 = "Seed Trough 1"
        SEED_TROUGH_2 = "Seed Trough 2"
        WATER_LOAD_SENSE = "Water Load Sense"
        LIGHTING_LOAD_SENSE = "Lighting Load Sense"
        VACUUM_LOAD_SENSE = "Vacuum Load Sense"
        PERIPHERAL_4_LOAD_SENSE = "Peripheral 4 Load Sense"
        PERIPHERAL_5_LOAD_SENSE = "Peripheral 5 Load Sense"
        ROTARY_TOOL_LOAD_SENSE = "Rotary Tool Load Sense"
      end

      TOOL_TYPES = {
        ToolNames::ROTARY_TOOL => "rotary_tool",
        ToolNames::SOIL_SENSOR => "soil_sensor",
        ToolNames::SEED_BIN => "seed_bin",
        ToolNames::SEED_TRAY => "seed_tray",
        ToolNames::SEEDER => "seeder",
        ToolNames::WEEDER => "weeder",
        ToolNames::WATERING_NOZZLE => "watering_nozzle",
        ToolNames::SEED_TROUGH_1 => "seed_trough",
        ToolNames::SEED_TROUGH_2 => "seed_trough",
      }.freeze

      TOOL_MOUNTABLE_VALUES = {
        ToolNames::ROTARY_TOOL => true,
        ToolNames::SOIL_SENSOR => true,
        ToolNames::SEED_BIN => false,
        ToolNames::SEED_TRAY => false,
        ToolNames::SEEDER => true,
        ToolNames::WEEDER => true,
        ToolNames::WATERING_NOZZLE => true,
        ToolNames::SEED_TROUGH_1 => false,
        ToolNames::SEED_TROUGH_2 => false,
      }.freeze

      PERIPHERAL_TYPES = {
        ToolNames::LIGHTING => "lighting",
        ToolNames::WATER => "water",
        ToolNames::VACUUM => "vacuum",
        ToolNames::ROTARY_TOOL => "rotary_tool",
        ToolNames::ROTARY_TOOL_REVERSE => "rotary_tool",
        ToolNames::PERIPHERAL_4 => "none",
        ToolNames::PERIPHERAL_5 => "none",
      }.freeze

      SENSOR_TYPES = {
        ToolNames::SOIL_SENSOR => "soil_moisture",
        ToolNames::TOOL_VERIFICATION => "tool_verification",
        ToolNames::WATER_LOAD_SENSE => "current",
        ToolNames::LIGHTING_LOAD_SENSE => "current",
        ToolNames::VACUUM_LOAD_SENSE => "current",
        ToolNames::PERIPHERAL_4_LOAD_SENSE => "current",
        ToolNames::PERIPHERAL_5_LOAD_SENSE => "current",
        ToolNames::ROTARY_TOOL_LOAD_SENSE => "current",
      }.freeze

      # Stub sequences ===========================
      SEQUENCE_FIXTURE_PATH =
        "app/mutations/devices/seeders/sequence_fixtures.yml"

      module SequenceSeeds
        def self.normalize_lua_indentation(node)
          case node
          when Array
            node.each { |child| normalize_lua_indentation(child) }
          when Hash
            lua = node.dig(:args, :lua)
            if node[:kind].to_s == "lua" && lua.is_a?(String)
              node[:args][:lua] = lua.strip_heredoc.gsub(/^ +/) do |spaces|
                ("  " * (spaces.length / 4)) + (" " * (spaces.length % 4))
              end
            end
            node.each_value { |child| normalize_lua_indentation(child) }
          end

          node
        end

        ALL = normalize_lua_indentation(YAML.load_file(SEQUENCE_FIXTURE_PATH))
        PICK_UP_SEED_EXPRESS = ALL.fetch(:PICK_UP_SEED_EXPRESS)
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
        PICK_FROM_SEED_TROUGH = ALL.fetch(:PICK_FROM_SEED_TROUGH)
        PICK_FROM_SEED_BIN = ALL.fetch(:PICK_FROM_SEED_BIN)
      end

      module PublicSequenceNames
        DISPENSE_WATER = "Dispense Water"
        SOIL_HEIGHT_GRID = "Soil Height Grid"
        GRID = "Grid"
        WATER_ALL = "Water all"
        PHOTO_GRID = "Photo Grid"
        WEED_DETECTION_GRID = "Weed Detection Grid"
        MOUNT_TOOL = "Mount Tool"
        DISMOUNT_TOOL = "Dismount Tool"
        MOW_ALL_WEEDS = "Mow All Weeds"
        PICK_FROM_SEED_TRAY = "Pick from Seed Tray"
        PICK_FROM_SEED_TROUGH = "Pick from Seed Trough"
        PICK_FROM_SEED_BIN = "Pick from Seed Bin"
      end
    end
  end
end
