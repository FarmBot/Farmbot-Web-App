module Devices
  module Seeders
    class GenesisOneTwo < AbstractGenesis
      def peripherals_vacuum
        add_peripheral(10, ToolNames::VACUUM)
      end

      def peripherals_water
        add_peripheral(9, ToolNames::WATER)
      end

      def settings_firmware
        device
          .fbos_config
          .update_attributes!(firmware_hardware: FbosConfig::ARDUINO)
      end

      def peripherals_lighting; end
      def peripherals_peripheral_4; end
      def peripherals_peripheral_5; end
    end
  end
end
