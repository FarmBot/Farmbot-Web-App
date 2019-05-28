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
        device.update_attributes!(name: "FarmBot Genesis")
      end

      def settings_enable_encoders
        device.firmware_config.update_attributes!(encoder_enabled_x: 1,
                                                  encoder_enabled_y: 1,
                                                  encoder_enabled_z: 1)
      end

      def tool_slots_slot_1
        add_tool_slot(name: ToolNames::SEEDER,
                      x: 50,
                      y: 100,
                      z: 200,
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
      def tools_seed_trough_3; end

      def tools_seeder
        @tools_seeder ||=
          add_tool(ToolNames::SEEDER)
      end

      def tools_soil_sensor
        @tools_soil_sensor ||=
          add_tool(ToolNames::SOIL_SENSOR)
      end

      def tools_watering_nozzle
        @tools_watering_nozzle ||=
          add_tool(ToolNames::WATERING_NOZZLE)
      end

      def tools_weeder
        @tools_weeder ||=
          add_tool(ToolNames::WEEDER)
      end

      def sequences_mount_tool
        s = SequenceSeeds::MOUNT_TOOL.deep_dup
        tool_id = device.tools.find_by!(name: ToolNames::SEEDER).id

        default_value = s.dig(:args, :locals, :body, 0, :args, :default_value)
        if_args = s.dig(:body, 4, :args)
        else_branch = if_args.dig(:_else, :args)
        read_pin = s.dig(:body, 3, :args, :pin_number, :args)

        default_value[:args][:tool_id] = tool_id
        else_branch[:sequence_id] = tool_error_id
        read_pin[:pin_id] = tool_verification_id
        if_args[:lhs][:args][:pin_id] = tool_verification_id

        Sequences::Create.run!(s, device: device)
      end

      def sequences_pick_up_seed
        s = SequenceSeeds::PICK_UP_SEED_GENESIS.deep_dup

        seed_bin_id = device.tools.find_by!(name: ToolNames::SEED_BIN).id
        mount_tool_id = device.sequences.find_by!(name: "Mount tool").id

        s.dig(:body, 0, :args)[:sequence_id] = mount_tool_id
        s.dig(:body, 0, :body, 0, :args, :data_value, :args)[:tool_id] = seeder_id
        s.dig(:body, 1, :args, :location, :args)[:tool_id] = seed_bin_id
        s.dig(:body, 2, :args, :pin_number, :args)[:pin_id] = vacuum_id
        s.dig(:body, 3, :args, :location, :args)[:tool_id] = seed_bin_id
        s.dig(:body, 4, :args, :location, :args)[:tool_id] = seed_bin_id

        Sequences::Create.run!(s, device: device)
        # when ProductLines::EXPRESS then raise "TODO"
      end

      def settings_firmware
        device
          .fbos_config
          .update_attributes!(firmware_hardware: FbosConfig::FARMDUINO)
      end

      def settings_default_map_size_x
        device.web_app_config.update_attributes!(map_size_x: 2_900)
      end

      def settings_default_map_size_y
        device.web_app_config.update_attributes!(map_size_y: 1_400)
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
