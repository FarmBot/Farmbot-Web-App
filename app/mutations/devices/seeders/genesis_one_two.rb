module Devices
  module Seeders
    class GenesisOneTwo < AbstractGenesis
      def peripherals_water
        add_peripheral(10, ToolNames::VACUUM)
      end

      def peripherals_vacuum
        add_peripheral(9, ToolNames::WATER)
      end

      def settings_firmware
        device
          .fbos_config
          .update_attributes!(firmware_hardware: FbosConfig::ARDUINO)
      end
    end
  end
end
