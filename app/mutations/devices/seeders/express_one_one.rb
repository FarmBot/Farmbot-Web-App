module Devices
  module Seeders
    class ExpressOneOne < AbstractExpress
      def settings_firmware
        device
          .fbos_config
          .update!(firmware_hardware: FbosConfig::EXPRESS_K11)
      end
    end
  end
end
