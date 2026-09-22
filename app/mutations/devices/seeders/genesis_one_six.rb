module Devices
  module Seeders
    class GenesisOneSix < GenesisOneFive
      FIRMWARE_HARDWARE = FbosConfig::FARMDUINO_K16

      def sensors_all_current
        add_sensor(55, ToolNames::WATER_LOAD_SENSE, ANALOG)
        add_sensor(54, ToolNames::LIGHTING_LOAD_SENSE, ANALOG)
        add_sensor(58, ToolNames::VACUUM_LOAD_SENSE, ANALOG)
        add_sensor(57, ToolNames::PERIPHERAL_4_LOAD_SENSE, ANALOG)
        add_sensor(56, ToolNames::PERIPHERAL_5_LOAD_SENSE, ANALOG)
        add_sensor(60, ToolNames::ROTARY_TOOL_LOAD_SENSE, ANALOG)
      end

      def peripherals_rotary_tool
        add_peripheral(2, ToolNames::ROTARY_TOOL)
      end

      def peripherals_rotary_tool_reverse
        add_peripheral(3, ToolNames::ROTARY_TOOL_REVERSE)
      end

      def tool_slots_slot_7
        add_tool_slot(x: TOOL_X,
                      y: TOOL_Y + 8 * TOOL_SPACING,
                      z: TOOL_Z,
                      tool: tools_rotary)
      end

      def tool_slots_slot_8
        add_tool_slot(x: 0,
                      y: TROUGH_Y,
                      z: TROUGH_Z,
                      tool: tools_seed_trough_1,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true,
                      mount_stage: MountStage::X)
      end

      def tool_slots_slot_9
        add_tool_slot(x: 0,
                      y: TROUGH_Y + TROUGH_SPACING,
                      z: TROUGH_Z,
                      tool: tools_seed_trough_2,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true,
                      mount_stage: MountStage::X)
      end

      def tools_rotary
        @tools_rotary ||=
          add_tool(ToolNames::ROTARY_TOOL,
                   effector_offset_x: 0,
                   effector_offset_y: 0,
                   effector_offset_z: 80)
      end

      def sequences_mow_all_weeds
        success = install_sequence_version_by_name(PublicSequenceNames::MOW_ALL_WEEDS)
        unless success
          s = SequenceSeeds::MOW_ALL_WEEDS.deep_dup
          Sequences::Create.run!(s, device: device)
        end
      end
    end
  end
end
