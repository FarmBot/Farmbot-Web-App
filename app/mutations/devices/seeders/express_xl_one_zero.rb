module Devices
  module Seeders
    class ExpressXlOneZero < AbstractExpress
      def settings_device_name
        device.update_attributes!(name: "FarmBot Express XL")
      end

      def settings_default_map_size_x
        device.web_app_config.update_attributes!(map_size_x: 6_000)
      end

      def settings_default_map_size_y
        device.web_app_config.update_attributes!(map_size_y: 2_400)
      end
    end
  end
end
