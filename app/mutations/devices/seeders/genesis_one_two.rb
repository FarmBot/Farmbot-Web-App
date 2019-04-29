module Devices
  module Seeders
    class GenesisOneTwo < Abstract
      SEQUENCES_PICKUP_SEED = Models::GENESIS
      SEQUENCES_MOUNT_TOOL = true
      SEQUENCES_PLANT_SEED = true
      SEQUENCES_TAKE_PHOTO_OF_PLANT = true
      SEQUENCES_TOOL_ERROR = true
      SEQUENCES_UNMOUNT_TOOL = true
      SEQUENCES_WATER_PLANT = true

      def peripherals_water
        attach_peripheral(10, VACUUM)
      end

      def peripherals_vacuum
        attach_peripheral(9, WATER)
      end

      def sensors_soil_sensor
        attach_sensor(59, SOIL_SENSOR, ANALOG)
      end

      def sensors_tool_verification
        attach_sensor(63, TOOL_VERIFICATION, DIGITAL)
      end
    end
  end
end
