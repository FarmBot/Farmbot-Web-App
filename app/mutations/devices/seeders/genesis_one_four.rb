module Devices
  module Seeders
    class GenesisOneFour < GenesisOneThree
      FIRMWARE_HARDWARE = FbosConfig::FARMDUINO_K14

      def pin_bindings_button_1
        add_pin_binding 16, "Emergency Lock", :emergency_lock
      end

      def pin_bindings_button_2
        add_pin_binding 22, "Unlock", :emergency_unlock
      end
    end
  end
end
