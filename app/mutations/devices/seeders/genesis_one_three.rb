module Devices
  module Seeders
    class GenesisOneThree < AbstractGenesis
      def settings_firmware
        device
          .fbos_config
          .update!(firmware_hardware: FbosConfig::FARMDUINO)
      end

      def pin_bindings_button_1; end
      def pin_bindings_button_2; end
    end
  end
end
