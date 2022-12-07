module Devices
  module Seeders
    class AbstractSeeder
      include Constants
      attr_reader :device

      # DO NOT ALPHABETIZE. ORDER MATTERS! - RC
      COMMAND_ORDER = [
        # PLANTS =================================
        :plants,

        # GROUPS =================================
        :point_groups_spinach,
        :point_groups_broccoli,
        :point_groups_beet,
        :point_groups_all_plants,
        :point_groups_all_points,
        :point_groups_all_weeds,

        # PERIPHERALS ============================
        :peripherals_vacuum,
        :peripherals_water,
        :peripherals_lighting,
        :peripherals_peripheral_4,
        :peripherals_peripheral_5,
        :peripherals_rotary_tool,
        :peripherals_rotary_tool_reverse,

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
        :settings_change_firmware_config_defaults,
        :settings_soil_height,
        :settings_firmware,
        :settings_gantry_height,
        :settings_hide_sensors,

        # TOOLS ==================================
        :tools_seed_bin,
        :tools_seed_tray,
        :tools_seed_trough_1,
        :tools_seed_trough_2,
        :tools_seeder,
        :tools_soil_sensor,
        :tools_watering_nozzle,
        :tools_weeder,
        :tools_rotary,

        # TOOL SLOTS =============================
        :tool_slots_slot_1,
        :tool_slots_slot_2,
        :tool_slots_slot_3,
        :tool_slots_slot_4,
        :tool_slots_slot_5,
        :tool_slots_slot_6,
        :tool_slots_slot_7,
        :tool_slots_slot_8,
        :tool_slots_slot_9,

        # WEBCAM FEEDS ===========================
        :webcam_feeds,

        # SEQUENCES ==============================
        :sequences_mount_tool,
        :sequences_dismount_tool,
        :sequences_pick_up_seed,
        :sequences_plant_seed,
        :sequences_find_home,
        :sequences_take_photo_of_plant,
        :sequences_water_plant,
        :sequences_water_all_plants,
        :sequences_water_all,
        :sequences_photo_grid,
        :sequences_weed_detection_grid,
        :sequences_soil_height_grid,
        :sequences_grid,
        :sequences_dispense_water,

        # EVERYTHING ELSE ========================
        :misc,
      ]

      def initialize(device)
        @device = device
      end

      def settings_hide_sensors
        device.web_app_config.update!(hide_sensors: false)
      end

      def plants; end

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
      def peripherals_rotary_tool; end
      def peripherals_rotary_tool_reverse; end
      def pin_bindings_button_1; end
      def pin_bindings_button_2; end
      def sensors_soil_sensor; end
      def sensors_tool_verification; end
      def sequences_mount_tool; end
      def sequences_dismount_tool; end
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

      def sequences_water_plant
        s = SequenceSeeds::WATER_PLANT.deep_dup

        s.dig(:body, 1, :args, :pin_number, :args)[:pin_id] = water_id
        s.dig(:body, 3, :args, :pin_number, :args)[:pin_id] = water_id

        Sequences::Create.run!(s, device: device)
      end

      def point_groups_spinach; end

      def point_groups_broccoli; end

      def point_groups_beet; end

      def point_groups_all_plants
        add_point_group(name: "All plants")
      end

      def point_groups_all_points
        add_point_group(name: "All points", pointer_type: "GenericPointer")
      end

      def point_groups_all_weeds
        add_point_group(name: "All weeds", pointer_type: "Weed")
      end

      def sequences_water_all_plants
        s = SequenceSeeds::WATER_ALL_PLANTS.deep_dup

        s.dig(:body, 0, :args)[:sequence_id] = water_plant_id
        s.dig(:body, 0, :body, 0, :args, :data_value, :args)[:point_group_id] =
          all_plants_group_id

        Sequences::Create.run!(s, device: device)
      end

      def sequences_find_home
        s = SequenceSeeds::FIND_HOME.deep_dup
        Sequences::Create.run!(s, device: device)
      end

      def sequences_water_all
        install_sequence_version_by_name(PublicSequenceNames::WATER_ALL)
      end

      def sequences_photo_grid
        install_sequence_version_by_name(PublicSequenceNames::PHOTO_GRID)
      end

      def sequences_weed_detection_grid
        install_sequence_version_by_name(PublicSequenceNames::WEED_DETECTION_GRID)
      end

      def sequences_soil_height_grid
        install_sequence_version_by_name(PublicSequenceNames::SOIL_HEIGHT_GRID)
      end

      def sequences_grid
        install_sequence_version_by_name(PublicSequenceNames::GRID)
      end

      def sequences_dispense_water
        install_sequence_version_by_name(PublicSequenceNames::DISPENSE_WATER)
      end

      def settings_default_map_size_x; end
      def settings_default_map_size_y; end
      def settings_device_name; end
      def settings_change_firmware_config_defaults; end
      def settings_soil_height; end

      def settings_soil_height
        device.fbos_config.update!(soil_height: -200)
      end

      def tool_slots_slot_1; end
      def tool_slots_slot_2; end
      def tool_slots_slot_3; end
      def tool_slots_slot_4; end
      def tool_slots_slot_5; end
      def tool_slots_slot_6; end
      def tool_slots_slot_7; end
      def tool_slots_slot_8; end
      def tool_slots_slot_9; end
      def tools_seed_bin; end
      def tools_seed_tray; end
      def tools_seed_trough_1; end
      def tools_seed_trough_2; end
      def tools_seeder; end
      def tools_soil_sensor; end
      def tools_watering_nozzle
        @tools_watering_nozzle ||=
          add_tool(ToolNames::WATERING_NOZZLE)
      end
      def tools_weeder; end
      def tools_rotary; end

      def webcam_feeds; end
      def misc; end

      private

      def install_sequence_version_by_name(name)
        sv = SequenceVersion
        .joins(Api::FeaturedSequencesController::JOIN)
        .where("sequence_publications.cached_author_email = ?",
          ENV["AUTHORIZED_PUBLISHER"])
        .where("sequence_publications.published = ?", true)
        .order(updated_at: :desc)
        .uniq(&:sequence_publication_id)
        .filter { |x| x.name == name }[0]

        if sv.nil?
          msg = "Unable to install public sequence: #{name}"
          device.tell(msg)
          Rollbar.error(msg)
        else
          Sequences::Install.run!(
            sequence_version: sv,
            device: device)
        end
      end

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
                            name: "Slot",
                            x: x,
                            y: y,
                            z: z,
                            tool_id: tool && tool.id,
                            pullout_direction: pullout_direction,
                            gantry_mounted: gantry_mounted,
                            device: device)
      end

      def add_point_group(name:, pointer_type: "Plant", openfarm_slug: nil)
        PointGroups::Create.run!(device: device,
                                 name: name,
                                 point_ids: [],
                                 sort_type: "yx_ascending",
                                 criteria: {
                                   string_eq: {
                                     pointer_type: [pointer_type],
                                     openfarm_slug: openfarm_slug ? [openfarm_slug] : nil,
                                   },
                                   number_eq: {},
                                   number_lt: {},
                                   number_gt: {},
                                   day: { op: "<", days_ago: 0 },
                                 })
      end

      def seeder_id
        @seeder_id ||= device.tools.find_by!(name: ToolNames::SEEDER).id
      end

      def water_plant_id
        @water_plant_id ||= device.sequences.find_by!(name: "Water plant").id
      end

      def all_plants_group_id
        @all_plants_group_id ||= device.point_groups.find_by!(name: "All plants").id
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
