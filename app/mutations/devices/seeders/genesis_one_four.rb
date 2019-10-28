module Devices
  module Seeders
    class GenesisOneFour < AbstractGenesis
      def settings_firmware
        device
          .fbos_config
          .update!(firmware_hardware: FbosConfig::FARMDUINO_K14)
      end
    end
  end
end
