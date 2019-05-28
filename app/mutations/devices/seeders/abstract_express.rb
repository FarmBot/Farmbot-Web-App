module Devices
  module Seeders
    class AbstractExpress < AbstractGenesis
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
          .update_attributes!(firmware_hardware: FbosConfig::EXPRESS_K10)
      end

      def tool_slots_slot_1
        add_tool_slot(name: ToolNames::SEED_TROUGH_1,
                      x: 0,
                      y: 25,
                      z: -200,
                      tool: tools_seed_trough_1,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true)
      end

      def tool_slots_slot_2
        add_tool_slot(name: ToolNames::SEED_TROUGH_2,
                      x: 0,
                      y: 50,
                      z: -200,
                      tool: tools_seed_trough_2,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true)
      end

      def tool_slots_slot_3
        add_tool_slot(name: ToolNames::SEED_TROUGH_3,
                      x: 0,
                      y: 75,
                      z: -200,
                      tool: tools_seed_trough_3,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true)
      end

      def tool_slots_slot_4; end
      def tool_slots_slot_5; end
      def tool_slots_slot_6; end
      def tools_seed_bin; end
      def tools_seed_tray; end

      def tools_seed_trough_1
        @tools_seed_trough_1 ||=
          add_tool(ToolNames::SEED_TROUGH_1)
      end

      def tools_seed_trough_2
        @tools_seed_trough_2 ||=
          add_tool(ToolNames::SEED_TROUGH_2)
      end

      def tools_seed_trough_3
        @tools_seed_trough_3 ||=
          add_tool(ToolNames::SEED_TROUGH_3)
      end

      def tools_seeder; end
      def tools_soil_sensor; end
      def tools_watering_nozzle; end
      def tools_weeder; end
      def sequences_mount_tool; end

      def sequences_pick_up_seed
        s = SequenceSeeds::PICK_UP_SEED_EXPRESS.deep_dup

        s.dig(:body, 1, :args, :location, :args)[:tool_id] = seed_trough_1_id
        s.dig(:body, 2, :args, :pin_number, :args)[:pin_id] = vacuum_id
        s.dig(:body, 3, :args, :location, :args)[:tool_id] = seed_trough_1_id
        s.dig(:body, 4, :args, :location, :args)[:tool_id] = seed_trough_1_id
        Sequences::Create.run!(s, device: device)
      end

      def sequences_tool_error; end
      def sequences_unmount_tool; end

      def settings_default_map_size_y
        device.web_app_config.update_attributes!(map_size_y: 1_200)
      end

      private

      def seed_trough_1_id
        @seed_trough_1_id ||= device.tools.find_by!(name: ToolNames::SEED_TROUGH_1).id
      end
    end
  end
end
