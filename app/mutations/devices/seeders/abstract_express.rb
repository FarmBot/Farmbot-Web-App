module Devices
  module Seeders
    class AbstractExpress < AbstractSeeder
      def peripherals_vacuum
        add_peripheral(9, ToolNames::VACUUM)
      end

      def peripherals_water
        add_peripheral(8, ToolNames::WATER)
      end

      def peripherals_lighting
        add_peripheral(7, ToolNames::LIGHTING)
      end

      def pin_bindings_button_1
        add_pin_binding 16, "Emergency Lock", :emergency_lock
      end

      def pin_bindings_button_2
        add_pin_binding 22, "Unlock", :emergency_unlock
      end

      def settings_device_name
        device.update!(name: Names::EXPRESS)
      end

      def settings_change_firmware_config_defaults
        device.firmware_config.update!(encoder_enabled_z: 0,
                                       movement_max_spd_y: 900,
                                       movement_min_spd_x: 300,
                                       movement_min_spd_y: 300,
                                       movement_home_spd_y: 500,
                                       movement_steps_acc_dec_x: 250,
                                       movement_steps_acc_dec_y: 250,
                                       encoder_missed_steps_max_x: 70,
                                       encoder_missed_steps_max_y: 60,
                                       encoder_missed_steps_max_z: 70,
                                       encoder_missed_steps_decay_x: 100,
                                       encoder_missed_steps_decay_y: 100,
                                       encoder_missed_steps_decay_z: 100)
      end

      def tool_slots_slot_1
        add_tool_slot(x: 0,
                      y: TROUGH_Y,
                      z: TROUGH_Z,
                      tool: tools_seed_trough_1,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true)
      end

      def tool_slots_slot_2
        add_tool_slot(x: 0,
                      y: TROUGH_Y + TROUGH_SPACING,
                      z: TROUGH_Z,
                      tool: tools_seed_trough_2,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true)
      end

      def tools_seed_trough_1
        @tools_seed_trough_1 ||=
          add_tool(ToolNames::SEED_TROUGH_1)
      end

      def tools_seed_trough_2
        @tools_seed_trough_2 ||=
          add_tool(ToolNames::SEED_TROUGH_2)
      end

      def sequences_pick_up_seed
        s = SequenceSeeds::PICK_UP_SEED_EXPRESS.deep_dup

        s.dig(:body, 0, :body, 0, :args, :axis_operand, :args)[:tool_id] = seed_trough_1_id
        s.dig(:body, 0, :body, 1, :args, :axis_operand, :args)[:tool_id] = seed_trough_1_id
        s.dig(:body, 0, :body, 2, :args, :axis_operand, :args)[:tool_id] = seed_trough_1_id
        s.dig(:body, 1, :args, :pin_number, :args)[:pin_id] = vacuum_id
        s.dig(:body, 2, :body, 0, :args, :axis_operand, :args)[:tool_id] = seed_trough_1_id
        s.dig(:body, 2, :body, 1, :args, :axis_operand, :args)[:tool_id] = seed_trough_1_id
        s.dig(:body, 2, :body, 2, :args, :axis_operand, :args)[:tool_id] = seed_trough_1_id
        s.dig(:body, 3, :body, 0, :args, :axis_operand, :args)[:tool_id] = seed_trough_1_id
        s.dig(:body, 3, :body, 1, :args, :axis_operand, :args)[:tool_id] = seed_trough_1_id
        s.dig(:body, 3, :body, 2, :args, :axis_operand, :args)[:tool_id] = seed_trough_1_id
        Sequences::Create.run!(s, device: device)
      end

      def sequences_plant_seed
        s = SequenceSeeds::PLANT_SEED_EXPRESS.deep_dup

        s.dig(:body, 2, :args, :pin_number, :args)[:pin_id] = vacuum_id
        Sequences::Create.run!(s, device: device)
      end

      def sequences_find_home
        s = SequenceSeeds::FIND_HOME_EXPRESS.deep_dup
        Sequences::Create.run!(s, device: device)
      end

      def settings_gantry_height
        device.fbos_config.update!(gantry_height: 140)
      end

      def settings_default_map_size_y
        device.web_app_config.update!(map_size_y: 930)
      end

      def settings_hide_sensors
        device.web_app_config.update!(hide_sensors: true)
      end

      def settings_three_d
        FarmwareEnvs::Create.run(
          { key: "3D_beamLength", value: "1200" },
          device: device)
      end

      private

      def seed_trough_1_id
        @seed_trough_1_id ||= device.tools.find_by!(name: ToolNames::SEED_TROUGH_1).id
      end
    end
  end
end
