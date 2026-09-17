module Devices
  module Seeders
    class GenesisOneSix < GenesisOneFive
      FIRMWARE_HARDWARE = FbosConfig::FARMDUINO_K16

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
                      gantry_mounted: true)
      end

      def tool_slots_slot_9
        add_tool_slot(x: 0,
                      y: TROUGH_Y + TROUGH_SPACING,
                      z: TROUGH_Z,
                      tool: tools_seed_trough_2,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true)
      end

      def tools_rotary
        @tools_rotary ||=
          add_tool(ToolNames::ROTARY_TOOL)
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
