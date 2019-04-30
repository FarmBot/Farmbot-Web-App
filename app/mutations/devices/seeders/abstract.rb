module Devices
  module Seeders
    class Abstract
      include Constants
      attr_reader :device

      PRODUCT_LINE = ProductLines::NONE

      # Class level configuration.
      # Change these values on child class to tune
      # default sequences.
      SEQUENCES_MOUNT_TOOL = false
      SEQUENCES_PICKUP_SEED = false
      SEQUENCES_PLANT_SEED = false
      SEQUENCES_TAKE_PHOTO_OF_PLANT = false
      SEQUENCES_TOOL_ERROR = false
      SEQUENCES_UNMOUNT_TOOL = false
      SEQUENCES_WATER_PLANT = false

      # DO NOT ALPHABETIZE. ORDER MATTERS! - RC
      COMMAND_ORDER = [
        # PLANTS =================================
        :plants,

        # PERIPHERALS ============================
        :peripherals_lighting,
        :peripherals_peripheral_4,
        :peripherals_peripheral_5,
        :peripherals_vacuum,
        :peripherals_water,

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

        # TOOL SLOTS =============================
        :tool_slots_slot_1,
        :tool_slots_slot_2,
        :tool_slots_slot_3,
        :tool_slots_slot_4,
        :tool_slots_slot_5,
        :tool_slots_slot_6,

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

        # SEQUENCES ==============================
        :sequences_mount_tool,
        :sequences_pick_up_seed,
        :sequences_plant_seed,
        :sequences_take_photo_of_plant,
        :sequences_tool_error,
        :sequences_unmount_tool,
        :sequences_water_plant,
      ]

      def initialize(device)
        @device = device
      end

      def plants
        PLANTS.map { |x| Points::Create.run!(x, device: device) }
      end

      def peripherals_lighting; end
      def peripherals_peripheral_4; end
      def peripherals_peripheral_5; end
      def peripherals_vacuum; end
      def peripherals_water; end
      def pin_bindings_button_1; end
      def pin_bindings_button_2; end
      def sensors_soil_sensor; end
      def sensors_tool_verification; end

      def sequences_mount_tool
        return unless self.class::SEQUENCES_MOUNT_TOOL
        build_tools_first
      end

      def sequences_pick_up_seed
        return unless self.class::SEQUENCES_PICKUP_SEED

        case self.class::PRODUCT_LINE
        when ProductLines::GENESIS
          build_tools_first
        when ProductLines::EXPRESS
          raise "TODO"
        when ProductLines::NONE
          return
        end
      end

      def sequences_plant_seed
        return unless self.class::SEQUENCES_PLANT_SEED
        puts "TODO"
      end

      def sequences_take_photo_of_plant
        return unless self.class::SEQUENCES_TAKE_PHOTO_OF_PLANT
        build_tools_first
      end

      def sequences_tool_error
        return unless self.class::SEQUENCES_TOOL_ERROR
        build_tools_first
      end

      def sequences_unmount_tool
        return unless self.class::SEQUENCES_UNMOUNT_TOOL
        build_tools_first
      end

      def sequences_water_plant
        return unless self.class::SEQUENCES_WATER_PLANT
        build_tools_first
      end

      def settings_default_map_size_x; end
      def settings_default_map_size_y; end

      def settings_device_name
        device.update_attributes!(name: "FarmBot Genesis")
      end

      def settings_enable_encoders
        case self.class::PRODUCT_LINE
        when ProductLines::GENESIS
          device.firmware_config.update_attributes!(encoder_enabled_x: 1,
                                                    encoder_enabled_y: 1,
                                                    encoder_enabled_z: 1)
        when ProductLines::EXPRESS
          device.firmware_config.update_attributes!(encoder_enabled_x: 0,
                                                    encoder_enabled_y: 0,
                                                    encoder_enabled_z: 0)
        when ProductLines::NONE
          return
        end
      end

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

      def build_tools_first
        puts "TODO - need to implement tools first!"
      end

      def attach_peripheral(pin, label)
        Peripherals::Create.run!(device: device,
                                 pin: pin,
                                 label: label)
      end

      def attach_sensor(pin, label, mode)
        Sensors::Create.run!(device: device,
                             pin: pin,
                             label: label,
                             mode: mode)
      end
    end
  end
end
