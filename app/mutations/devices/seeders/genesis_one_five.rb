module Devices
  module Seeders
    class GenesisOneFive < AbstractGenesis
      def settings_firmware
        device
          .fbos_config
          .update!(firmware_hardware: FbosConfig::FARMDUINO_K15)
      end
    end
  end
end
