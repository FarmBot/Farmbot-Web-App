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
        :settings_map_xl,

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
      ]

      unless Rails.env.production?
        # PROBLEM:
        #  * FBOS v8 is not out yet.
        #  * The seed sequences use variables (FBOS >= v8)
        #  * You already wrote all the tests and stuff.
        # SOLUTION:
        #  * Leave the tests in place
        #  * Disable the behavior in production ENVs
        #  * Put this code back in the main array when v8 is released.
        # SEQUENCES ==============================
        [:sequences_tool_error,
         :sequences_mount_tool,
         :sequences_pick_up_seed,
         :sequences_plant_seed,
         :sequences_take_photo_of_plant,
         :sequences_unmount_tool,
         :sequences_water_plant].map do |x|
          COMMAND_ORDER.push(x)
         end
      end

      def initialize(device)
        @device = device
      end

      def settings_map_xl
        device.web_app_config.update_attributes!(map_xl: false)
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

      def peripherals_vacuum; end
      def peripherals_water; end
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
      def settings_device_name; end
      def settings_enable_encoders; end
      def settings_firmware; end
      def tool_slots_slot_1; end
      def tool_slots_slot_2; end
      def tool_slots_slot_3; end
      def tool_slots_slot_4; end
      def tool_slots_slot_5; end
      def tool_slots_slot_6; end
      def tools_seed_bin; end
      def tools_seed_tray; end
      def tools_seed_trough_1; end
      def tools_seed_trough_2; end
      def tools_seed_trough_3; end
      def tools_seeder; end
      def tools_soil_sensor; end
      def tools_watering_nozzle; end
      def tools_weeder; end

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
