module Devices
  module Seeders
    class GenesisOneTwo < AbstractSeeder
      PRODUCT_LINE = ProductLines::GENESIS
      SEQUENCES_PICKUP_SEED = true
      SEQUENCES_MOUNT_TOOL = true
      SEQUENCES_PLANT_SEED = true
      SEQUENCES_TAKE_PHOTO_OF_PLANT = true
      SEQUENCES_TOOL_ERROR = true
      SEQUENCES_UNMOUNT_TOOL = true
      SEQUENCES_WATER_PLANT = true

      def peripherals_water
        add_peripheral(10, ToolNames::VACUUM)
      end

      def peripherals_vacuum
        add_peripheral(9, ToolNames::WATER)
      end

      def sensors_soil_sensor
        add_sensor(59, ToolNames::SOIL_SENSOR, ANALOG)
      end

      def sensors_tool_verification
        add_sensor(63, ToolNames::TOOL_VERIFICATION, DIGITAL)
      end

      def settings_firmware
        device
          .fbos_config
          .update_attributes!(firmware_hardware: FbosConfig::ARDUINO)
      end
    end
  end
end
