module Devices
  module Seeders
    class None < AbstractSeeder
      def plants; end
      def peripherals_vacuum; end
      def peripherals_water; end
      def peripherals_lighting; end
      def peripherals_peripheral_4; end
      def peripherals_peripheral_5; end
      def pin_bindings_button_1; end
      def pin_bindings_button_2; end
      def sensors_soil_sensor; end
      def sensors_tool_verification; end
      def settings_default_map_size_x; end
      def settings_default_map_size_y; end

      def settings_device_name
        device.update_attributes!(name: "FarmBot")
      end

      def settings_enable_encoders
        device.firmware_config.update_attributes!(encoder_enabled_x: 0,
                                                  encoder_enabled_y: 0,
                                                  encoder_enabled_z: 0)
      end

      def settings_firmware
        device
          .fbos_config
          .update_attributes!(firmware_hardware: FbosConfig::NONE)
      end

      def tools_seed_bin; end
      def tools_seed_tray; end
      def tools_seed_trough_1; end
      def tools_seed_trough_2; end
      def tools_seed_trough_3; end
      def tools_seeder; end
      def tools_soil_sensor; end
      def tools_watering_nozzle; end
      def tools_weeder; end
      def tool_slots_slot_1; end
      def tool_slots_slot_2; end
      def tool_slots_slot_3; end
      def tool_slots_slot_4; end
      def tool_slots_slot_5; end
      def tool_slots_slot_6; end
      def sequences_tool_error; end
      def sequences_mount_tool; end
      def sequences_pick_up_seed; end
      def sequences_plant_seed; end
      def sequences_take_photo_of_plant; end
      def sequences_unmount_tool; end
      def sequences_water_plant; end
    end
  end
end
