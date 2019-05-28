module Devices
  module Seeders
    class GenesisXlOneFour < AbstractGenesis
      def settings_firmware
        device
          .fbos_config
          .update_attributes!(firmware_hardware: FbosConfig::FARMDUINO_K14)
      end

      def settings_device_name
        device.update_attributes!(name: "FarmBot Genesis XL")
      end

      def settings_default_map_size_x
        device.web_app_config.update_attributes!(map_size_x: 5_900)
      end

      def settings_default_map_size_y
        device.web_app_config.update_attributes!(map_size_y: 2_900)
      end

      def settings_map_xl
        device.web_app_config.update_attributes!(map_xl: true)
      end
    end
  end
end
