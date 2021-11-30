module Devices
  module Seeders
    class GenesisOneSix < AbstractGenesis
      def settings_firmware
        device
          .fbos_config
          .update!(firmware_hardware: FbosConfig::FARMDUINO_K16)
      end

      def settings_change_firmware_config_defaults
        device.firmware_config.update!(encoder_enabled_x: 1,
                                       encoder_enabled_y: 1,
                                       encoder_enabled_z: 1)
      end

      def peripherals_rotary_tool
        add_peripheral(2, ToolNames::ROTARY_TOOL)
      end

      def peripherals_rotary_tool_reverse
        add_peripheral(3, ToolNames::ROTARY_TOOL_REVERSE)
      end

      def tool_slots_slot_7
        add_tool_slot(name: ToolNames::ROTARY_TOOL,
                      x: 50,
                      y: 800,
                      z: -200,
                      tool: tools_rotary)
      end

      def tool_slots_slot_8
        add_tool_slot(name: ToolNames::SEED_TROUGH_1,
                      x: 0,
                      y: 25,
                      z: 0,
                      tool: tools_seed_trough_1,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true)
      end

      def tool_slots_slot_9
        add_tool_slot(name: ToolNames::SEED_TROUGH_2,
                      x: 0,
                      y: 50,
                      z: 0,
                      tool: tools_seed_trough_2,
                      pullout_direction: ToolSlot::NONE,
                      gantry_mounted: true)
      end

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
    end
  end
end
