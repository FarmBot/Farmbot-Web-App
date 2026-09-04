module Devices
  module Seeders
    module GenesisXl
      def settings_device_name
        device.update!(name: Constants::Names::GENESIS_XL)
      end

      def settings_default_map_size_x
        device.web_app_config.update!(map_size_x: 5_900)
      end

      def settings_default_map_size_y
        device.web_app_config.update!(map_size_y: 2_730)
      end

      def settings_three_d
        FarmwareEnvs::Create.run(
          { key: "3D_beamLength", value: "3000" },
          device: device)
        super
      end
    end
  end
end
