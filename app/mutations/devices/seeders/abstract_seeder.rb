module Devices
  module Seeders
    class AbstractSeeder
      include Constants
      attr_reader :device

      # DO NOT ALPHABETIZE. ORDER MATTERS! - RC
      COMMAND_ORDER = [
        # PLANTS =================================
        :plants,

        # PERIPHERALS ============================
        :peripherals_vacuum,
        :peripherals_water,
        :peripherals_lighting,
        :peripherals_peripheral_4,
        :peripherals_peripheral_5,

        # PIN BINDINGS ===========================
        :pin_bindings_button_1,
        :pin_bindings_button_2,

        # SENSORS ================================
        :sensors_soil_sensor,
        :sensors_tool_verification,

        # SETTINGS ===============================
        :settings_default_map_size_x,
        :settings_default_map_size_y,
        :settings_device_name,
        :settings_enable_encoders,
        :settings_firmware,

        # TOOLS ==================================
        :tools_seed_bin,
        :tools_seed_tray,
        :tools_seed_trough_1,
        :tools_seed_trough_2,
        :tools_seed_trough_3,
        :tools_seeder,
        :tools_soil_sensor,
        :tools_watering_nozzle,
        :tools_weeder,

        # TOOL SLOTS =============================
        :tool_slots_slot_1,
        :tool_slots_slot_2,
        :tool_slots_slot_3,
        :tool_slots_slot_4,
        :tool_slots_slot_5,
        :tool_slots_slot_6,

        # SEQUENCES ==============================
        :sequences_tool_error,
        :sequences_mount_tool,
        :sequences_pick_up_seed,
        :sequences_plant_seed,
        :sequences_take_photo_of_plant,
        :sequences_unmount_tool,
        :sequences_water_plant,
      ]

      def initialize(device)
        @device = device
      end

      def plants
        PLANTS.map { |x| Points::Create.run!(x, device: device) }
      end

      def peripherals_lighting
        add_peripheral(7, ToolNames::LIGHTING)
      end

      def peripherals_peripheral_4
        add_peripheral(10, "Peripheral 4")
      end

      def peripherals_peripheral_5
        add_peripheral(12, "Peripheral 5")
      end

      def peripherals_vacuum
        add_peripheral(9, ToolNames::VACUUM)
      end

      def peripherals_water
        add_peripheral(8, ToolNames::WATER)
      end

      def pin_bindings_button_1; end
      def pin_bindings_button_2; end
      def sensors_soil_sensor; end
      def sensors_tool_verification; end
      def sequences_mount_tool; end
      def sequences_pick_up_seed; end

      def sequences_plant_seed
        s = SequenceSeeds::PLANT_SEED.deep_dup

        s.dig(:body, 2, :args, :pin_number, :args)[:pin_id] = vacuum_id
        Sequences::Create.run!(s, device: device)
      end

      def sequences_take_photo_of_plant
        s = SequenceSeeds::TAKE_PHOTO_OF_PLANT.deep_dup
        Sequences::Create.run!(s, device: device)
      end

      def sequences_tool_error
        Sequences::Create.run!(SequenceSeeds::TOOL_ERROR, device: device)
      end

      def sequences_unmount_tool
        s = SequenceSeeds::UNMOUNT_TOOL.deep_dup

        s.dig(:args,
              :locals,
              :body,
              0,
              :args,
              :default_value,
              :args)[:tool_id] = seeder_id
        s.dig(:body, 5, :args, :pin_number, :args)[:pin_id] = tool_verification_id
        s.dig(:body, 6, :args, :lhs, :args)[:pin_id] = tool_verification_id
        s.dig(:body, 6, :args, :_else, :args)[:sequence_id] = tool_error_id
        Sequences::Create.run!(s, device: device)
      end

      def sequences_water_plant
        s = SequenceSeeds::WATER_PLANT.deep_dup

        s.dig(:body, 1, :args, :pin_number, :args)[:pin_id] = water_id
        s.dig(:body, 3, :args, :pin_number, :args)[:pin_id] = water_id

        Sequences::Create.run!(s, device: device)
      end

      def settings_default_map_size_x; end
      def settings_default_map_size_y; end

      def settings_device_name
        device.update_attributes!(name: "FarmBot Genesis")
      end

      def settings_enable_encoders; end

      def settings_firmware; end

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

      private

      def add_tool(name)
        Tools::Create.run!(name: name, device: device)
      end

      def add_pin_binding(pin, label, action)
        PinBindings::Create.run!(pin_num: pin,
                                 label: label,
                                 special_action: action,
                                 device: device)
      end

      def add_peripheral(pin, label)
        Peripherals::Create.run!(device: device,
                                 pin: pin,
                                 label: label)
      end

      def add_sensor(pin, label, mode)
        Sensors::Create.run!(device: device,
                             pin: pin,
                             label: label,
                             mode: mode)
      end

      def add_tool_slot(name:,
                        x:,
                        y:,
                        z:,
                        tool:,
                        pullout_direction: ToolSlot::POSITIVE_X,
                        gantry_mounted: false)
        Points::Create.run!(pointer_type: "ToolSlot",
                            name: name,
                            x: x,
                            y: y,
                            z: z,
                            tool_id: tool && tool.id,
                            pullout_direction: pullout_direction,
                            gantry_mounted: gantry_mounted,
                            device: device)
      end

      def seeder_id
        @seeder_id ||= device.tools.find_by!(name: ToolNames::SEEDER).id
      end

      def tool_verification_id
        @tool_verification_id ||= device.sensors.find_by!(label: "Tool Verification").id
      end

      def tool_error_id
        @tool_error_id ||= device.sequences.find_by!(name: "Tool error").id
      end

      def water_id
        @water_id ||= device.peripherals.find_by!(label: "Water").id
      end

      def vacuum_id
        @vacuum_id ||= device.peripherals.find_by!(label: ToolNames::VACUUM).id
      end
    end
  end
end
