module Devices
  module Seeders
    class AbstractExpress < AbstractGenesis
      PRODUCT_LINE = Devices::Seeders::Constants::ProductLines::EXPRESS
      SEQUENCES_MOUNT_TOOL = false
      SEQUENCES_PICKUP_SEED = false
      SEQUENCES_PLANT_SEED = false
      SEQUENCES_TAKE_PHOTO_OF_PLANT = false
      SEQUENCES_TOOL_ERROR = false
      SEQUENCES_UNMOUNT_TOOL = false
      SEQUENCES_WATER_PLANT = false

      def settings_device_name
        device.update_attributes!(name: "FarmBot Express")
      end
      def sensors_soil_sensor; end
      def sensors_tool_verification; end

      def settings_enable_encoders
        device.firmware_config.update_attributes!(encoder_enabled_x: 0,
                                                  encoder_enabled_y: 0,
                                                  encoder_enabled_z: 0)
      end

      def settings_firmware
        device
          .fbos_config
          .update_attributes!(firmware_hardware: FbosConfig::EXPRESS_V10)
      end

      def tool_slots_slot_1
        add_tool_slot(ToolNames::SEED_TROUGH_1,
        0,
        25,
        -200,
        ToolSlot::NONE,
        true)
      end

      def tool_slots_slot_2
        add_tool_slot(ToolNames::SEED_TROUGH_2,
        0,
        50,
        -200,
        ToolSlot::NONE,
        true)
      end

      def tool_slots_slot_3
        add_tool_slot(ToolNames::SEED_TROUGH_3,
        0,
        75,
        -200,
        ToolSlot::NONE,
        true)
      end

      def tool_slots_slot_4; end
      def tool_slots_slot_5; end
      def tool_slots_slot_6; end
      def tools_seed_bin; end
      def tools_seed_tray; end

      def tools_seed_trough_1
        add_tool(ToolNames::SEED_TROUGH_1)
      end

      def tools_seed_trough_2
        add_tool(ToolNames::SEED_TROUGH_2)
      end

      def tools_seed_trough_3
        add_tool(ToolNames::SEED_TROUGH_3)
      end
      def tools_seeder; end
      def tools_soil_sensor; end
      def tools_watering_nozzle; end
      def tools_weeder; end
      def sequences_mount_tool; end

      def sequences_pickup_seed
        binding.pry # Hmm...
      end

      def sequences_tool_error; end
      def sequences_unmount_tool; end

      def settings_default_map_size_y
        device.web_app_config.update_attributes!(map_size_y: 1_200)
      end
    end
  end
end
