module Devices
  module Seeders
    class AbstractGenesis < AbstractSeeder
      def peripherals_vacuum
        add_peripheral(9, ToolNames::VACUUM)
      end

      def peripherals_water
        add_peripheral(8, ToolNames::WATER)
      end

      def sensors_soil_sensor
        add_sensor(59, ToolNames::SOIL_SENSOR, ANALOG)
      end

      def sensors_tool_verification
        add_sensor(63, ToolNames::TOOL_VERIFICATION, DIGITAL)
      end

      def settings_device_name
        device.update!(name: Names::GENESIS)
      end

      def settings_change_firmware_config_defaults
        device.firmware_config.update!(encoder_enabled_x: 1,
                                       encoder_enabled_y: 1,
                                       encoder_enabled_z: 1)
      end

      def tool_slots_slot_1
        add_tool_slot(name: ToolNames::SEEDER,
                      x: 50,
                      y: 100,
                      z: -200,
                      tool: tools_seeder)
      end

      def tool_slots_slot_2
        add_tool_slot(name: ToolNames::SEED_BIN,
                      x: 50,
                      y: 200,
                      z: -200,
                      tool: tools_seed_bin)
      end

      def tool_slots_slot_3
        add_tool_slot(name: ToolNames::SEED_TRAY,
                      x: 50,
                      y: 300,
                      z: -200,
                      tool: tools_seed_tray)
      end

      def tool_slots_slot_4
        add_tool_slot(name: ToolNames::WATERING_NOZZLE,
                      x: 50,
                      y: 500,
                      z: -200,
                      tool: tools_watering_nozzle)
      end

      def tool_slots_slot_5
        add_tool_slot(name: ToolNames::SOIL_SENSOR,
                      x: 50,
                      y: 600,
                      z: -200,
                      tool: tools_soil_sensor)
      end

      def tool_slots_slot_6
        add_tool_slot(name: ToolNames::WEEDER,
                      x: 50,
                      y: 700,
                      z: -200,
                      tool: tools_weeder)
      end

      def tool_slots_slot_7; end
      def tool_slots_slot_8; end
      def tool_slots_slot_9; end

      def tools_seed_bin
        @tools_seed_bin ||=
          add_tool(ToolNames::SEED_BIN)
      end

      def tools_seed_tray
        @tools_seed_tray ||=
          add_tool(ToolNames::SEED_TRAY)
      end

      def tools_seed_trough_1; end
      def tools_seed_trough_2; end

      def tools_seeder
        @tools_seeder ||=
          add_tool(ToolNames::SEEDER)
      end

      def tools_soil_sensor
        @tools_soil_sensor ||=
          add_tool(ToolNames::SOIL_SENSOR)
      end

      def tools_weeder
        @tools_weeder ||=
          add_tool(ToolNames::WEEDER)
      end

      def tools_rotary; end

      def sequences_mount_tool
        install_sequence_version_by_name("Mount Tool")
      end

      def sequences_dismount_tool
        install_sequence_version_by_name("Dismount Tool")
      end

      def sequences_pick_up_seed
        s = SequenceSeeds::PICK_UP_SEED_GENESIS.deep_dup

        seed_bin_id = device.tools.find_by!(name: ToolNames::SEED_BIN).id
        mount_tool_id = device.sequences.find_by!(name: "Mount Tool").id

        s.dig(:body, 0, :args)[:sequence_id] = mount_tool_id
        s.dig(:body, 0, :body, 0, :args, :data_value, :args)[:tool_id] = seeder_id
        s.dig(:body, 1, :body, 0, :args, :axis_operand, :args)[:tool_id] = seed_bin_id
        s.dig(:body, 1, :body, 1, :args, :axis_operand, :args)[:tool_id] = seed_bin_id
        s.dig(:body, 1, :body, 2, :args, :axis_operand, :args)[:tool_id] = seed_bin_id
        s.dig(:body, 2, :args, :pin_number, :args)[:pin_id] = vacuum_id
        s.dig(:body, 3, :body, 0, :args, :axis_operand, :args)[:tool_id] = seed_bin_id
        s.dig(:body, 3, :body, 1, :args, :axis_operand, :args)[:tool_id] = seed_bin_id
        s.dig(:body, 3, :body, 2, :args, :axis_operand, :args)[:tool_id] = seed_bin_id
        s.dig(:body, 4, :body, 0, :args, :axis_operand, :args)[:tool_id] = seed_bin_id
        s.dig(:body, 4, :body, 1, :args, :axis_operand, :args)[:tool_id] = seed_bin_id
        s.dig(:body, 4, :body, 2, :args, :axis_operand, :args)[:tool_id] = seed_bin_id

        Sequences::Create.run!(s, device: device)
      end

      def settings_gantry_height
        device.fbos_config.update!(gantry_height: 120)
      end

      def settings_default_map_size_x
        device.web_app_config.update!(map_size_x: 2_900)
      end

      def settings_default_map_size_y
        device.web_app_config.update!(map_size_y: 1_400)
      end

      def pin_bindings_button_1
        add_pin_binding 16, "Emergency Lock", :emergency_lock
      end

      def pin_bindings_button_2
        add_pin_binding 22, "Unlock", :emergency_unlock
      end
    end
  end
end
