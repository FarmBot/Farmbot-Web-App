module Devices
  module Seeders
    class GenesisOneTwo < AbstractGenesis
      FIRMWARE_HARDWARE = FbosConfig::ARDUINO

      def peripherals_vacuum
        add_peripheral(10, ToolNames::VACUUM)
      end

      def peripherals_water
        add_peripheral(9, ToolNames::WATER)
      end
    end
  end
end
