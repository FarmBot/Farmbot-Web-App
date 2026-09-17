module Devices
  module Seeders
    class GenesisOneNine < GenesisOneEight
      FIRMWARE_HARDWARE = FbosConfig::FARMDUINO_K19

      def tool_slots_slot_4
        add_tool_slot(x: TOOL_X,
                      y: TOOL_Y + 4 * TOOL_SPACING,
                      z: TOOL_Z,
                      tool: tools_soil_sensor)
      end

      def tool_slots_slot_5
        add_tool_slot(x: TOOL_X,
                      y: TOOL_Y + 5 * TOOL_SPACING,
                      z: TOOL_Z,
                      tool: tools_rotary)
      end

      def tool_slots_slot_6
        add_tool_slot(x: 0,
                      y: TROUGH_Y,
                      z: TROUGH_Z,
                      tool: tools_seed_trough_1,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true)
      end

      def tool_slots_slot_7
        add_tool_slot(x: 0,
                      y: TROUGH_Y + TROUGH_SPACING,
                      z: TROUGH_Z,
                      tool: tools_seed_trough_2,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true)
      end

      def tool_slots_slot_8; end

      def settings_three_d
        FarmwareEnvs::Create.run(
          { key: "3D_zAxisLength", value: "800" },
          device: device)
      end
    end
  end
end
