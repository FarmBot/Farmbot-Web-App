module Devices
  module Seeders
    class XlOneFour < AbstractGenesis
      def settings_default_map_size_x
        device.web_app_config.update_attributes!(map_size_x: 6_000)
      end

      def settings_default_map_size_y
        device.web_app_config.update_attributes!(map_size_y: 3_000)
      end

      def settings_device_name
        device.update_attributes!(name: "FarmBot Genesis XL")
      end
    end
  end
end
