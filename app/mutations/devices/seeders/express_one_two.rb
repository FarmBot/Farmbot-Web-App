module Devices
  module Seeders
    class ExpressOneTwo < AbstractExpress
      def settings_firmware
        device
          .fbos_config
          .update!(firmware_hardware: FbosConfig::EXPRESS_K12)
      end
    end
  end
end
