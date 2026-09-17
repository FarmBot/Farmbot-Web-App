module Devices
  module Seeders
    class GenesisOneSeven < GenesisOneSix
      FIRMWARE_HARDWARE = FbosConfig::FARMDUINO_K17

      def tool_slots_slot_6
        add_tool_slot(x: TOOL_X,
                      y: TOOL_Y + 7 * TOOL_SPACING,
                      z: TOOL_Z,
                      tool: tools_rotary)
      end

      def tool_slots_slot_7
        add_tool_slot(x: 0,
                      y: TROUGH_Y,
                      z: TROUGH_Z,
                      tool: tools_seed_trough_1,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true)
      end

      def tool_slots_slot_8
        add_tool_slot(x: 0,
                      y: TROUGH_Y + TROUGH_SPACING,
                      z: TROUGH_Z,
                      tool: tools_seed_trough_2,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true)
      end

      def tool_slots_slot_9; end

      def tools_weeder; end
    end
  end
end
