module Devices
  module Seeders
    class GenesisOneEight < AbstractGenesis
      def settings_firmware
        device
          .fbos_config
          .update!(firmware_hardware: FbosConfig::FARMDUINO_K18)
      end

      def peripherals_rotary_tool
        add_peripheral(2, ToolNames::ROTARY_TOOL)
      end

      def peripherals_rotary_tool_reverse
        add_peripheral(3, ToolNames::ROTARY_TOOL_REVERSE)
      end

      def tool_slots_slot_6
        add_tool_slot(name: ToolNames::ROTARY_TOOL,
                      x: TOOL_X,
                      y: TOOL_Y + 7 * TOOL_SPACING,
                      z: TOOL_Z,
                      tool: tools_rotary)
      end

      def tool_slots_slot_7
        add_tool_slot(name: ToolNames::SEED_TROUGH_1,
                      x: 0,
                      y: TROUGH_Y,
                      z: TROUGH_Z,
                      tool: tools_seed_trough_1,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true)
      end

      def tool_slots_slot_8
        add_tool_slot(name: ToolNames::SEED_TROUGH_2,
                      x: 0,
                      y: TROUGH_Y + TROUGH_SPACING,
                      z: TROUGH_Z,
                      tool: tools_seed_trough_2,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true)
      end

      def tool_slots_slot_9; end

      def tools_weeder; end

      def tools_rotary
        @tools_rotary ||=
          add_tool(ToolNames::ROTARY_TOOL)
      end

      def tools_seed_trough_1
        @tools_seed_trough_1 ||=
          add_tool(ToolNames::SEED_TROUGH_1)
      end

      def tools_seed_trough_2
        @tools_seed_trough_2 ||=
          add_tool(ToolNames::SEED_TROUGH_2)
      end

      def sequences_mow_all_weeds
        success = install_sequence_version_by_name(PublicSequenceNames::MOW_ALL_WEEDS)
        if !success
          s = SequenceSeeds::MOW_ALL_WEEDS.deep_dup
          Sequences::Create.run!(s, device: device)
        end
      end
    end
  end
end
