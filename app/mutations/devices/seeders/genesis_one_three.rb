module Devices
  module Seeders
    class GenesisOneThree < AbstractGenesis
      def peripherals_vacuum
        add_peripheral(9, ToolNames::VACUUM)
      end

      def peripherals_water
        add_peripheral(8, ToolNames::WATER)
      end

      def settings_firmware
        device
          .fbos_config
          .update_attributes!(firmware_hardware: FbosConfig::FARMDUINO)
      end
    end
  end
end
