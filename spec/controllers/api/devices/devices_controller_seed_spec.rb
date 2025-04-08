require "spec_helper"

describe Api::DevicesController do
  include Devise::Test::ControllerHelpers
  Names = Devices::Seeders::Constants::Names
  PublicSequenceNames = Devices::Seeders::Constants::PublicSequenceNames

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  describe "#seed" do
    def peripherals_lighting?(device)
      device.peripherals.find_by(label: "Lighting")
    end

    def peripherals_peripheral_4?(device)
      device.peripherals.find_by(label: "Peripheral 4")
    end

    def peripherals_peripheral_5?(device)
      device.peripherals.find_by(label: "Peripheral 5")
    end

    def peripherals_vacuum?(device)
      device.peripherals.find_by(label: "Vacuum")
    end

    def peripherals_water?(device)
      device.peripherals.find_by(label: "Water")
    end

    def peripherals_rotary_tool?(device)
      device.peripherals.find_by(label: "Rotary Tool")
    end

    def peripherals_rotary_tool_reverse?(device)
      device.peripherals.find_by(label: "Rotary Tool Reverse")
    end

    def pin_bindings_button_1?(device)
      device.pin_bindings.find_by(pin_num: 16)
    end

    def pin_bindings_button_2?(device)
      device.pin_bindings.find_by(pin_num: 22)
    end

    def plant_count?(device)
      device.plants.count
    end

    def sensors_soil_sensor?(device)
      device.sensors.find_by(label: "Soil Sensor")
    end

    def sensors_tool_verification?(device)
      device.sensors.find_by(label: "Tool Verification")
    end

    def settings_device_name?(device)
      device.name
    end

    def settings_hide_sensors?(device)
      device.web_app_config.hide_sensors
    end

    def settings_change_firmware_config_defaults?(device)
      c = device.firmware_config

      return c.movement_motor_current_x == 1646
    end

    def settings_soil_height?(device)
      device.fbos_config.soil_height
    end

    def settings_gantry_height?(device)
      device.fbos_config.gantry_height
    end

    def settings_firmware?(device)
      device.fbos_config.firmware_hardware
    end

    def tool_slots_slot_1?(device)
      device.tool_slots.order(id: :asc)[0]
    end

    def tool_slots_slot_2?(device)
      device.tool_slots.order(id: :asc)[1]
    end

    def tool_slots_slot_3?(device)
      device.tool_slots.order(id: :asc)[2]
    end

    def tool_slots_slot_4?(device)
      device.tool_slots.order(id: :asc)[3]
    end

    def tool_slots_slot_5?(device)
      device.tool_slots.order(id: :asc)[4]
    end

    def tool_slots_slot_6?(device)
      device.tool_slots.order(id: :asc)[5]
    end

    def tool_slots_slot_7?(device)
      device.tool_slots.order(id: :asc)[6]
    end

    def tool_slots_slot_8?(device)
      device.tool_slots.order(id: :asc)[7]
    end

    def tool_slots_slot_9?(device)
      device.tool_slots.order(id: :asc)[8]
    end

    def tools_seed_bin?(device)
      device.tools.find_by(name: "Seed Bin")
    end

    def tools_seed_tray?(device)
      device.tools.find_by(name: "Seed Tray")
    end

    def tools_seed_trough_1?(device)
      device.tools.find_by(name: "Seed Trough 1")
    end

    def tools_seed_trough_2?(device)
      device.tools.find_by(name: "Seed Trough 2")
    end

    def tools_seeder?(device)
      device.tools.find_by(name: "Seeder")
    end

    def tools_soil_sensor?(device)
      device.tools.find_by(name: "Soil Sensor")
    end

    def tools_watering_nozzle?(device)
      device.tools.find_by(name: "Watering Nozzle")
    end

    def tools_weeder?(device)
      device.tools.find_by(name: "Weeder")
    end

    def tools_rotary?(device)
      device.tools.find_by(name: "Rotary Tool")
    end

    def sequences_mount_tool?(device)
      device.sequences.find_by(name: PublicSequenceNames::MOUNT_TOOL)
    end

    def sequences_dismount_tool?(device)
      device.sequences.find_by(name: PublicSequenceNames::DISMOUNT_TOOL)
    end

    def sequences_mow_all_weeds?(device)
      device.sequences.find_by(name: PublicSequenceNames::MOW_ALL_WEEDS)
    end

    def sequences_pick_from_seed_tray?(device)
      device.sequences.find_by(name: PublicSequenceNames::PICK_FROM_SEED_TRAY)
    end

    def sequences_pickup_seed?(device)
      device.sequences.find_by(name: "Pick up seed")
    end

    def sequences_plant_seed?(device)
      device.sequences.find_by(name: "Plant seed")
    end

    def sequences_take_photo_of_plant?(device)
      device.sequences.find_by(name: "Take photo of plant")
    end

    def sequences_water_plant?(device)
      device.sequences.find_by(name: "Water plant")
    end

    def point_groups_spinach?(device)
      device.point_groups.find_by(name: "Spinach plants")
    end

    def point_groups_broccoli?(device)
      device.point_groups.find_by(name: "Broccoli plants")
    end

    def point_groups_beet?(device)
      device.point_groups.find_by(name: "Beet plants")
    end

    def point_groups_all_plants?(device)
      device.point_groups.find_by(name: "All plants")
    end

    def point_groups_all_points?(device)
      device.point_groups.find_by(name: "All points")
    end

    def point_groups_all_weeds?(device)
      device.point_groups.find_by(name: "All weeds")
    end

    def sequences_find_home?(device)
      device.sequences.find_by(name: "Find Home")
    end

    def sequences_water_all_plants?(device)
      device.sequences.find_by(name: "Water all plants")
    end

    def sequences_water_all?(device)
      device.sequences.find_by(name: PublicSequenceNames::WATER_ALL)
    end

    def sequences_photo_grid?(device)
      device.sequences.find_by(name: PublicSequenceNames::PHOTO_GRID)
    end

    def sequences_weed_detection_grid?(device)
      device.sequences.find_by(name: PublicSequenceNames::WEED_DETECTION_GRID)
    end

    def sequences_soil_height_grid?(device)
      device.sequences.find_by(name: PublicSequenceNames::SOIL_HEIGHT_GRID)
    end

    def sequences_grid?(device)
      device.sequences.find_by(name: PublicSequenceNames::GRID)
    end

    def sequences_dispense_water?(device)
      device.sequences.find_by(name: PublicSequenceNames::DISPENSE_WATER)
    end

    def settings_default_map_size_x?(device)
      device.web_app_config.map_size_x
    end

    def settings_default_map_size_y?(device)
      device.web_app_config.map_size_y
    end

    it "seeds accounts with default data" do
      sign_in user
      device = user.device
      old_name = device.name
      expect(device.plants.count).to eq(0)
      expect(device.sequences.count).to eq(0)
      run_jobs_now do
        post :seed, body: { product_line: "none" }.to_json
      end
      expect(response.status).to eq(200)
      expect(device.plants.count).to eq(0)
      expect(device.sequences.count).to eq(0)
      expect(device.reload.name).to eq(old_name)
    end

    def start_tests(product_line, publish = true, demo = false)
      u = FactoryBot.create(:user)
      ClimateControl.modify AUTHORIZED_PUBLISHER: u.email do
        if publish
          [
            PublicSequenceNames::DISPENSE_WATER,
            PublicSequenceNames::SOIL_HEIGHT_GRID,
            PublicSequenceNames::GRID,
            PublicSequenceNames::WATER_ALL,
            PublicSequenceNames::PHOTO_GRID,
            PublicSequenceNames::WEED_DETECTION_GRID,
            PublicSequenceNames::MOUNT_TOOL,
            PublicSequenceNames::DISMOUNT_TOOL,
            PublicSequenceNames::MOW_ALL_WEEDS,
            PublicSequenceNames::PICK_FROM_SEED_TRAY,
          ].map do |name|
            s = Sequences::Create.run!(device: u.device,
                                        name: name,
                                        body: [])
            Sequences::Publish.run!(device: u.device,
                                        sequence: Sequence.find(s[:id]),
                                        description: "published",
                                        copyright: "farmbot")
          end
        end
        sign_in user
        run_jobs_now do
          post :seed, body: { product_line: product_line, demo: demo }.to_json
        end
        expect(response.status).to eq(200)
        device.reload
      end
    end

    def check_slot_pairing(slot, expected_name)
      if expected_name
        expect(slot.tool.name).to eq(expected_name)
      else
        expect(slot.tool).to be(nil)
      end
    end

    it "seeds accounts with Genesis 1.2 data" do
      start_tests "genesis_1.2"

      expect(peripherals_lighting?(device)).to_not be
      expect(peripherals_peripheral_4?(device)).to_not be
      expect(peripherals_peripheral_5?(device)).to_not be
      expect(peripherals_vacuum?(device).pin).to eq(10)
      expect(peripherals_water?(device).pin).to eq(9)
      expect(peripherals_rotary_tool?(device)).to_not be
      expect(peripherals_rotary_tool_reverse?(device)).to_not be
      expect(pin_bindings_button_1?(device)).to_not be
      expect(pin_bindings_button_2?(device)).to_not be
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device)).to be_kind_of(Sensor)
      expect(sensors_tool_verification?(device)).to be_kind_of(Sensor)
      expect(settings_device_name?(device)).to eq(Names::GENESIS)
      expect(settings_change_firmware_config_defaults?(device)).to be(true)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(120)
      expect(settings_firmware?(device)).to eq("arduino")
      expect(settings_hide_sensors?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device).name).to eq("Slot")
      expect(tool_slots_slot_4?(device).name).to eq("Slot")
      expect(tool_slots_slot_5?(device).name).to eq("Slot")
      expect(tool_slots_slot_6?(device).name).to eq("Slot")
      expect(tool_slots_slot_7?(device)).to_not be
      expect(tool_slots_slot_8?(device)).to_not be
      expect(tool_slots_slot_9?(device)).to_not be

      check_slot_pairing(tool_slots_slot_1?(device), "Seeder")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Bin")
      check_slot_pairing(tool_slots_slot_3?(device), "Seed Tray")
      check_slot_pairing(tool_slots_slot_4?(device), "Watering Nozzle")
      check_slot_pairing(tool_slots_slot_5?(device), "Soil Sensor")
      check_slot_pairing(tool_slots_slot_6?(device), "Weeder")

      expect(tools_seed_bin?(device)).to be
      expect(tools_seed_tray?(device)).to be
      expect(tools_seed_trough_1?(device)).to_not be
      expect(tools_seed_trough_2?(device)).to_not be
      expect(tools_seeder?(device)).to be_kind_of(Tool)
      expect(tools_soil_sensor?(device)).to be_kind_of(Tool)
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to be_kind_of(Tool)
      expect(tools_rotary?(device)).to_not be
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_dismount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_mow_all_weeds?(device)).to_not be
      expect(sequences_pick_from_seed_tray?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(2900)
      expect(settings_default_map_size_y?(device)).to eq(1230)
    end

    it "seeds accounts with Genesis 1.3 data" do
      start_tests "genesis_1.3"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device).pin).to eq(10)
      expect(peripherals_peripheral_5?(device).pin).to eq(12)
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device)).to_not be
      expect(peripherals_rotary_tool_reverse?(device)).to_not be
      expect(pin_bindings_button_1?(device)).to_not be
      expect(pin_bindings_button_2?(device)).to_not be
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device).pin).to eq(59)
      expect(sensors_tool_verification?(device).pin).to eq(63)
      expect(settings_device_name?(device)).to eq(Names::GENESIS)
      expect(settings_change_firmware_config_defaults?(device)).to be(true)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(120)
      expect(settings_firmware?(device)).to eq("farmduino")
      expect(settings_hide_sensors?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device).name).to eq("Slot")
      expect(tool_slots_slot_4?(device).name).to eq("Slot")
      expect(tool_slots_slot_5?(device).name).to eq("Slot")
      expect(tool_slots_slot_6?(device).name).to eq("Slot")
      expect(tool_slots_slot_7?(device)).to_not be
      expect(tool_slots_slot_8?(device)).to_not be
      expect(tool_slots_slot_9?(device)).to_not be

      check_slot_pairing(tool_slots_slot_1?(device), "Seeder")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Bin")
      check_slot_pairing(tool_slots_slot_3?(device), "Seed Tray")
      check_slot_pairing(tool_slots_slot_4?(device), "Watering Nozzle")
      check_slot_pairing(tool_slots_slot_5?(device), "Soil Sensor")
      check_slot_pairing(tool_slots_slot_6?(device), "Weeder")

      expect(tools_seed_bin?(device)).to be
      expect(tools_seed_tray?(device)).to be
      expect(tools_seed_trough_1?(device)).to_not be
      expect(tools_seed_trough_2?(device)).to_not be
      expect(tools_seeder?(device)).to be_kind_of(Tool)
      expect(tools_soil_sensor?(device)).to be_kind_of(Tool)
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to be_kind_of(Tool)
      expect(tools_rotary?(device)).to_not be
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_dismount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_mow_all_weeds?(device)).to_not be
      expect(sequences_pick_from_seed_tray?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(2900)
      expect(settings_default_map_size_y?(device)).to eq(1230)
    end

    it "seeds accounts with Genesis 1.4 data" do
      start_tests "genesis_1.4"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device).pin).to eq(10)
      expect(peripherals_peripheral_5?(device).pin).to eq(12)
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device)).to_not be
      expect(peripherals_rotary_tool_reverse?(device)).to_not be
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device).pin).to eq(59)
      expect(sensors_tool_verification?(device).pin).to eq(63)
      expect(settings_device_name?(device)).to eq(Names::GENESIS)
      expect(settings_change_firmware_config_defaults?(device)).to be(true)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(120)
      expect(settings_firmware?(device)).to eq("farmduino_k14")
      expect(settings_hide_sensors?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device).name).to eq("Slot")
      expect(tool_slots_slot_4?(device).name).to eq("Slot")
      expect(tool_slots_slot_5?(device).name).to eq("Slot")
      expect(tool_slots_slot_6?(device).name).to eq("Slot")
      expect(tool_slots_slot_7?(device)).to_not be
      expect(tool_slots_slot_8?(device)).to_not be
      expect(tool_slots_slot_9?(device)).to_not be

      check_slot_pairing(tool_slots_slot_1?(device), "Seeder")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Bin")
      check_slot_pairing(tool_slots_slot_3?(device), "Seed Tray")
      check_slot_pairing(tool_slots_slot_4?(device), "Watering Nozzle")
      check_slot_pairing(tool_slots_slot_5?(device), "Soil Sensor")
      check_slot_pairing(tool_slots_slot_6?(device), "Weeder")

      expect(tools_seed_bin?(device)).to be
      expect(tools_seed_tray?(device)).to be
      expect(tools_seed_trough_1?(device)).to_not be
      expect(tools_seed_trough_2?(device)).to_not be
      expect(tools_seeder?(device)).to be_kind_of(Tool)
      expect(tools_soil_sensor?(device)).to be_kind_of(Tool)
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to be_kind_of(Tool)
      expect(tools_rotary?(device)).to_not be
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_dismount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_mow_all_weeds?(device)).to_not be
      expect(sequences_pick_from_seed_tray?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(2900)
      expect(settings_default_map_size_y?(device)).to eq(1230)
    end

    it "seeds accounts with Genesis 1.5 data" do
      start_tests "genesis_1.5"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device).pin).to eq(10)
      expect(peripherals_peripheral_5?(device).pin).to eq(12)
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device)).to_not be
      expect(peripherals_rotary_tool_reverse?(device)).to_not be
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device).pin).to eq(59)
      expect(sensors_tool_verification?(device).pin).to eq(63)
      expect(settings_device_name?(device)).to eq(Names::GENESIS)
      expect(settings_change_firmware_config_defaults?(device)).to be(true)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(120)
      expect(settings_firmware?(device)).to eq("farmduino_k15")
      expect(settings_hide_sensors?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device).name).to eq("Slot")
      expect(tool_slots_slot_4?(device).name).to eq("Slot")
      expect(tool_slots_slot_5?(device).name).to eq("Slot")
      expect(tool_slots_slot_6?(device).name).to eq("Slot")
      expect(tool_slots_slot_7?(device).name).to eq("Slot")
      expect(tool_slots_slot_8?(device).name).to eq("Slot")
      expect(tool_slots_slot_9?(device)).to_not be

      check_slot_pairing(tool_slots_slot_1?(device), "Seeder")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Bin")
      check_slot_pairing(tool_slots_slot_3?(device), "Seed Tray")
      check_slot_pairing(tool_slots_slot_4?(device), "Watering Nozzle")
      check_slot_pairing(tool_slots_slot_5?(device), "Soil Sensor")
      check_slot_pairing(tool_slots_slot_6?(device), "Weeder")
      check_slot_pairing(tool_slots_slot_7?(device), "Seed Trough 1")
      check_slot_pairing(tool_slots_slot_8?(device), "Seed Trough 2")

      expect(tools_seed_bin?(device)).to be
      expect(tools_seed_tray?(device)).to be
      expect(tools_seed_trough_1?(device)).to be
      expect(tools_seed_trough_2?(device)).to be
      expect(tools_seeder?(device)).to be_kind_of(Tool)
      expect(tools_soil_sensor?(device)).to be_kind_of(Tool)
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to be_kind_of(Tool)
      expect(tools_rotary?(device)).to_not be
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_dismount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_mow_all_weeds?(device)).to_not be
      expect(sequences_pick_from_seed_tray?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(2900)
      expect(settings_default_map_size_y?(device)).to eq(1230)
    end

    it "seeds accounts with Genesis 1.6 data" do
      start_tests "genesis_1.6"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device).pin).to eq(10)
      expect(peripherals_peripheral_5?(device).pin).to eq(12)
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device).pin).to eq(2)
      expect(peripherals_rotary_tool_reverse?(device).pin).to eq(3)
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device).pin).to eq(59)
      expect(sensors_tool_verification?(device).pin).to eq(63)
      expect(settings_device_name?(device)).to eq(Names::GENESIS)
      expect(settings_change_firmware_config_defaults?(device)).to be(true)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(120)
      expect(settings_firmware?(device)).to eq("farmduino_k16")
      expect(settings_hide_sensors?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device).name).to eq("Slot")
      expect(tool_slots_slot_4?(device).name).to eq("Slot")
      expect(tool_slots_slot_5?(device).name).to eq("Slot")
      expect(tool_slots_slot_6?(device).name).to eq("Slot")
      expect(tool_slots_slot_7?(device).name).to eq("Slot")
      expect(tool_slots_slot_8?(device).name).to eq("Slot")
      expect(tool_slots_slot_9?(device).name).to eq("Slot")

      check_slot_pairing(tool_slots_slot_1?(device), "Seeder")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Bin")
      check_slot_pairing(tool_slots_slot_3?(device), "Seed Tray")
      check_slot_pairing(tool_slots_slot_4?(device), "Watering Nozzle")
      check_slot_pairing(tool_slots_slot_5?(device), "Soil Sensor")
      check_slot_pairing(tool_slots_slot_6?(device), "Weeder")
      check_slot_pairing(tool_slots_slot_7?(device), "Rotary Tool")
      check_slot_pairing(tool_slots_slot_8?(device), "Seed Trough 1")
      check_slot_pairing(tool_slots_slot_9?(device), "Seed Trough 2")

      expect(tools_seed_bin?(device)).to be
      expect(tools_seed_tray?(device)).to be
      expect(tools_seed_trough_1?(device)).to be
      expect(tools_seed_trough_2?(device)).to be
      expect(tools_seeder?(device)).to be_kind_of(Tool)
      expect(tools_soil_sensor?(device)).to be_kind_of(Tool)
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to be_kind_of(Tool)
      expect(tools_rotary?(device)).to be_kind_of(Tool)
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_dismount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_mow_all_weeds?(device)).to be_kind_of(Sequence)
      expect(sequences_pick_from_seed_tray?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(2900)
      expect(settings_default_map_size_y?(device)).to eq(1230)
    end

    it "seeds accounts with Genesis 1.7 data" do
      start_tests "genesis_1.7"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device).pin).to eq(10)
      expect(peripherals_peripheral_5?(device).pin).to eq(12)
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device).pin).to eq(2)
      expect(peripherals_rotary_tool_reverse?(device).pin).to eq(3)
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device).pin).to eq(59)
      expect(sensors_tool_verification?(device).pin).to eq(63)
      expect(settings_device_name?(device)).to eq(Names::GENESIS)
      expect(settings_change_firmware_config_defaults?(device)).to be(true)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(120)
      expect(settings_firmware?(device)).to eq("farmduino_k17")
      expect(settings_hide_sensors?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device).name).to eq("Slot")
      expect(tool_slots_slot_4?(device).name).to eq("Slot")
      expect(tool_slots_slot_5?(device).name).to eq("Slot")
      expect(tool_slots_slot_6?(device).name).to eq("Slot")
      expect(tool_slots_slot_7?(device).name).to eq("Slot")
      expect(tool_slots_slot_8?(device).name).to eq("Slot")
      expect(tool_slots_slot_9?(device)).to_not be

      check_slot_pairing(tool_slots_slot_1?(device), "Seeder")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Bin")
      check_slot_pairing(tool_slots_slot_3?(device), "Seed Tray")
      check_slot_pairing(tool_slots_slot_4?(device), "Watering Nozzle")
      check_slot_pairing(tool_slots_slot_5?(device), "Soil Sensor")
      check_slot_pairing(tool_slots_slot_6?(device), "Rotary Tool")
      check_slot_pairing(tool_slots_slot_7?(device), "Seed Trough 1")
      check_slot_pairing(tool_slots_slot_8?(device), "Seed Trough 2")

      expect(tools_seed_bin?(device)).to be
      expect(tools_seed_tray?(device)).to be
      expect(tools_seed_trough_1?(device)).to be
      expect(tools_seed_trough_2?(device)).to be
      expect(tools_seeder?(device)).to be_kind_of(Tool)
      expect(tools_soil_sensor?(device)).to be_kind_of(Tool)
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to_not be
      expect(tools_rotary?(device)).to be_kind_of(Tool)
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_dismount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_mow_all_weeds?(device)).to be_kind_of(Sequence)
      expect(sequences_pick_from_seed_tray?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(2900)
      expect(settings_default_map_size_y?(device)).to eq(1230)
    end

    it "seeds accounts with Genesis XL 1.4 data" do
      start_tests "genesis_xl_1.4"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device).pin).to eq(10)
      expect(peripherals_peripheral_5?(device).pin).to eq(12)
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device)).to_not be
      expect(peripherals_rotary_tool_reverse?(device)).to_not be
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device).pin).to eq(59)
      expect(sensors_tool_verification?(device).pin).to eq(63)
      expect(settings_device_name?(device)).to eq(Names::GENESIS_XL)
      expect(settings_change_firmware_config_defaults?(device)).to be(true)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(120)
      expect(settings_firmware?(device)).to eq("farmduino_k14")
      expect(settings_hide_sensors?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device).name).to eq("Slot")
      expect(tool_slots_slot_4?(device).name).to eq("Slot")
      expect(tool_slots_slot_5?(device).name).to eq("Slot")
      expect(tool_slots_slot_6?(device).name).to eq("Slot")
      expect(tool_slots_slot_7?(device)).to_not be
      expect(tool_slots_slot_8?(device)).to_not be
      expect(tool_slots_slot_9?(device)).to_not be

      check_slot_pairing(tool_slots_slot_1?(device), "Seeder")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Bin")
      check_slot_pairing(tool_slots_slot_3?(device), "Seed Tray")
      check_slot_pairing(tool_slots_slot_4?(device), "Watering Nozzle")
      check_slot_pairing(tool_slots_slot_5?(device), "Soil Sensor")
      check_slot_pairing(tool_slots_slot_6?(device), "Weeder")

      expect(tools_seed_bin?(device)).to be
      expect(tools_seed_tray?(device)).to be
      expect(tools_seed_trough_1?(device)).to_not be
      expect(tools_seed_trough_2?(device)).to_not be
      expect(tools_seeder?(device)).to be_kind_of(Tool)
      expect(tools_soil_sensor?(device)).to be_kind_of(Tool)
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to be_kind_of(Tool)
      expect(tools_rotary?(device)).to_not be
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_dismount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_mow_all_weeds?(device)).to_not be
      expect(sequences_pick_from_seed_tray?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(5900)
      expect(settings_default_map_size_y?(device)).to eq(2730)
    end

    it "seeds accounts with Genesis XL 1.5 data" do
      start_tests "genesis_xl_1.5"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device).pin).to eq(10)
      expect(peripherals_peripheral_5?(device).pin).to eq(12)
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device)).to_not be
      expect(peripherals_rotary_tool_reverse?(device)).to_not be
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device).pin).to eq(59)
      expect(sensors_tool_verification?(device).pin).to eq(63)
      expect(settings_device_name?(device)).to eq(Names::GENESIS_XL)
      expect(settings_change_firmware_config_defaults?(device)).to be(true)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(120)
      expect(settings_firmware?(device)).to eq("farmduino_k15")
      expect(settings_hide_sensors?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device).name).to eq("Slot")
      expect(tool_slots_slot_4?(device).name).to eq("Slot")
      expect(tool_slots_slot_5?(device).name).to eq("Slot")
      expect(tool_slots_slot_6?(device).name).to eq("Slot")
      expect(tool_slots_slot_7?(device).name).to eq("Slot")
      expect(tool_slots_slot_8?(device).name).to eq("Slot")
      expect(tool_slots_slot_9?(device)).to_not be

      check_slot_pairing(tool_slots_slot_1?(device), "Seeder")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Bin")
      check_slot_pairing(tool_slots_slot_3?(device), "Seed Tray")
      check_slot_pairing(tool_slots_slot_4?(device), "Watering Nozzle")
      check_slot_pairing(tool_slots_slot_5?(device), "Soil Sensor")
      check_slot_pairing(tool_slots_slot_6?(device), "Weeder")
      check_slot_pairing(tool_slots_slot_7?(device), "Seed Trough 1")
      check_slot_pairing(tool_slots_slot_8?(device), "Seed Trough 2")

      expect(tools_seed_bin?(device)).to be
      expect(tools_seed_tray?(device)).to be
      expect(tools_seed_trough_1?(device)).to be
      expect(tools_seed_trough_2?(device)).to be
      expect(tools_seeder?(device)).to be_kind_of(Tool)
      expect(tools_soil_sensor?(device)).to be_kind_of(Tool)
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to be_kind_of(Tool)
      expect(tools_rotary?(device)).to_not be
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_dismount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_mow_all_weeds?(device)).to_not be
      expect(sequences_pick_from_seed_tray?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(5900)
      expect(settings_default_map_size_y?(device)).to eq(2730)
    end

    it "seeds accounts with Genesis XL 1.7 data" do
      start_tests "genesis_xl_1.7"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device).pin).to eq(10)
      expect(peripherals_peripheral_5?(device).pin).to eq(12)
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device).pin).to eq(2)
      expect(peripherals_rotary_tool_reverse?(device).pin).to eq(3)
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device).pin).to eq(59)
      expect(sensors_tool_verification?(device).pin).to eq(63)
      expect(settings_device_name?(device)).to eq(Names::GENESIS_XL)
      expect(settings_change_firmware_config_defaults?(device)).to be(true)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(120)
      expect(settings_firmware?(device)).to eq("farmduino_k17")
      expect(settings_hide_sensors?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device).name).to eq("Slot")
      expect(tool_slots_slot_4?(device).name).to eq("Slot")
      expect(tool_slots_slot_5?(device).name).to eq("Slot")
      expect(tool_slots_slot_6?(device).name).to eq("Slot")
      expect(tool_slots_slot_7?(device).name).to eq("Slot")
      expect(tool_slots_slot_8?(device).name).to eq("Slot")
      expect(tool_slots_slot_9?(device)).to_not be

      check_slot_pairing(tool_slots_slot_1?(device), "Seeder")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Bin")
      check_slot_pairing(tool_slots_slot_3?(device), "Seed Tray")
      check_slot_pairing(tool_slots_slot_4?(device), "Watering Nozzle")
      check_slot_pairing(tool_slots_slot_5?(device), "Soil Sensor")
      check_slot_pairing(tool_slots_slot_6?(device), "Rotary Tool")
      check_slot_pairing(tool_slots_slot_7?(device), "Seed Trough 1")
      check_slot_pairing(tool_slots_slot_8?(device), "Seed Trough 2")

      expect(tools_seed_bin?(device)).to be
      expect(tools_seed_tray?(device)).to be
      expect(tools_seed_trough_1?(device)).to be
      expect(tools_seed_trough_2?(device)).to be
      expect(tools_seeder?(device)).to be_kind_of(Tool)
      expect(tools_soil_sensor?(device)).to be_kind_of(Tool)
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to_not be
      expect(tools_rotary?(device)).to be_kind_of(Tool)
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_dismount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_mow_all_weeds?(device)).to be_kind_of(Sequence)
      expect(sequences_pick_from_seed_tray?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(5900)
      expect(settings_default_map_size_y?(device)).to eq(2730)
    end

    it "seeds accounts with Genesis XL 1.6 data" do
      start_tests "genesis_xl_1.6"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device).pin).to eq(10)
      expect(peripherals_peripheral_5?(device).pin).to eq(12)
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device).pin).to eq(2)
      expect(peripherals_rotary_tool_reverse?(device).pin).to eq(3)
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device).pin).to eq(59)
      expect(sensors_tool_verification?(device).pin).to eq(63)
      expect(settings_device_name?(device)).to eq(Names::GENESIS_XL)
      expect(settings_change_firmware_config_defaults?(device)).to be(true)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(120)
      expect(settings_firmware?(device)).to eq("farmduino_k16")
      expect(settings_hide_sensors?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device).name).to eq("Slot")
      expect(tool_slots_slot_4?(device).name).to eq("Slot")
      expect(tool_slots_slot_5?(device).name).to eq("Slot")
      expect(tool_slots_slot_6?(device).name).to eq("Slot")
      expect(tool_slots_slot_7?(device).name).to eq("Slot")
      expect(tool_slots_slot_8?(device).name).to eq("Slot")
      expect(tool_slots_slot_9?(device).name).to eq("Slot")

      check_slot_pairing(tool_slots_slot_1?(device), "Seeder")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Bin")
      check_slot_pairing(tool_slots_slot_3?(device), "Seed Tray")
      check_slot_pairing(tool_slots_slot_4?(device), "Watering Nozzle")
      check_slot_pairing(tool_slots_slot_5?(device), "Soil Sensor")
      check_slot_pairing(tool_slots_slot_6?(device), "Weeder")
      check_slot_pairing(tool_slots_slot_7?(device), "Rotary Tool")
      check_slot_pairing(tool_slots_slot_8?(device), "Seed Trough 1")
      check_slot_pairing(tool_slots_slot_9?(device), "Seed Trough 2")

      expect(tools_seed_bin?(device)).to be
      expect(tools_seed_tray?(device)).to be
      expect(tools_seed_trough_1?(device)).to be
      expect(tools_seed_trough_2?(device)).to be
      expect(tools_seeder?(device)).to be_kind_of(Tool)
      expect(tools_soil_sensor?(device)).to be_kind_of(Tool)
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to be_kind_of(Tool)
      expect(tools_rotary?(device)).to be_kind_of(Tool)
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_dismount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_mow_all_weeds?(device)).to be_kind_of(Sequence)
      expect(sequences_pick_from_seed_tray?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(5900)
      expect(settings_default_map_size_y?(device)).to eq(2730)
    end

    it "seeds accounts with Express 1.0 data" do
      start_tests "express_1.0"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device)).to_not be
      expect(peripherals_peripheral_5?(device)).to_not be
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device)).to_not be
      expect(peripherals_rotary_tool_reverse?(device)).to_not be
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device)).to_not be
      expect(sensors_tool_verification?(device)).to_not be
      expect(settings_device_name?(device)).to eq(Names::EXPRESS)
      expect(settings_change_firmware_config_defaults?(device)).to be(false)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(140)
      expect(settings_firmware?(device)).to eq("express_k10")
      expect(settings_hide_sensors?(device)).to be(true)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device)).to_not be
      expect(tool_slots_slot_4?(device)).to_not be
      expect(tool_slots_slot_5?(device)).to_not be
      expect(tool_slots_slot_6?(device)).to_not be
      expect(tool_slots_slot_7?(device)).to_not be
      expect(tool_slots_slot_8?(device)).to_not be
      expect(tool_slots_slot_9?(device)).to_not be

      check_slot_pairing(tool_slots_slot_1?(device), "Seed Trough 1")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Trough 2")

      expect(tools_seed_bin?(device)).to_not be
      expect(tools_seed_tray?(device)).to_not be
      expect(tools_seed_trough_1?(device)).to be
      expect(tools_seed_trough_2?(device)).to be
      expect(tools_seeder?(device)).to_not be
      expect(tools_soil_sensor?(device)).to_not be
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to_not be
      expect(tools_rotary?(device)).to_not be
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to_not be
      expect(sequences_dismount_tool?(device)).to_not be
      expect(sequences_mow_all_weeds?(device)).to_not be
      expect(sequences_pick_from_seed_tray?(device)).to_not be
      expect(settings_default_map_size_x?(device)).to eq(2900)
      expect(settings_default_map_size_y?(device)).to eq(1200)
    end

    it "seeds accounts with Express 1.1 data" do
      start_tests "express_1.1"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device)).to_not be
      expect(peripherals_peripheral_5?(device)).to_not be
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device)).to_not be
      expect(peripherals_rotary_tool_reverse?(device)).to_not be
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device)).to_not be
      expect(sensors_tool_verification?(device)).to_not be
      expect(settings_device_name?(device)).to eq(Names::EXPRESS)
      expect(settings_change_firmware_config_defaults?(device)).to be(false)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(140)
      expect(settings_firmware?(device)).to eq("express_k11")
      expect(settings_hide_sensors?(device)).to be(true)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device)).to_not be
      expect(tool_slots_slot_4?(device)).to_not be
      expect(tool_slots_slot_5?(device)).to_not be
      expect(tool_slots_slot_6?(device)).to_not be
      expect(tool_slots_slot_7?(device)).to_not be
      expect(tool_slots_slot_8?(device)).to_not be
      expect(tool_slots_slot_9?(device)).to_not be

      check_slot_pairing(tool_slots_slot_1?(device), "Seed Trough 1")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Trough 2")

      expect(tools_seed_bin?(device)).to_not be
      expect(tools_seed_tray?(device)).to_not be
      expect(tools_seed_trough_1?(device)).to be
      expect(tools_seed_trough_2?(device)).to be
      expect(tools_seeder?(device)).to_not be
      expect(tools_soil_sensor?(device)).to_not be
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to_not be
      expect(tools_rotary?(device)).to_not be
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to_not be
      expect(sequences_dismount_tool?(device)).to_not be
      expect(sequences_mow_all_weeds?(device)).to_not be
      expect(sequences_pick_from_seed_tray?(device)).to_not be
      expect(settings_default_map_size_x?(device)).to eq(2900)
      expect(settings_default_map_size_y?(device)).to eq(1200)
    end

    it "seeds accounts with Express 1.2 data" do
      start_tests "express_1.2"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device)).to_not be
      expect(peripherals_peripheral_5?(device)).to_not be
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device)).to_not be
      expect(peripherals_rotary_tool_reverse?(device)).to_not be
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device)).to_not be
      expect(sensors_tool_verification?(device)).to_not be
      expect(settings_device_name?(device)).to eq(Names::EXPRESS)
      expect(settings_change_firmware_config_defaults?(device)).to be(false)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(140)
      expect(settings_firmware?(device)).to eq("express_k12")
      expect(settings_hide_sensors?(device)).to be(true)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device)).to_not be
      expect(tool_slots_slot_4?(device)).to_not be
      expect(tool_slots_slot_5?(device)).to_not be
      expect(tool_slots_slot_6?(device)).to_not be
      expect(tool_slots_slot_7?(device)).to_not be
      expect(tool_slots_slot_8?(device)).to_not be
      expect(tool_slots_slot_9?(device)).to_not be

      check_slot_pairing(tool_slots_slot_1?(device), "Seed Trough 1")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Trough 2")

      expect(tools_seed_bin?(device)).to_not be
      expect(tools_seed_tray?(device)).to_not be
      expect(tools_seed_trough_1?(device)).to be
      expect(tools_seed_trough_2?(device)).to be
      expect(tools_seeder?(device)).to_not be
      expect(tools_soil_sensor?(device)).to_not be
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to_not be
      expect(tools_rotary?(device)).to_not be
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to_not be
      expect(sequences_dismount_tool?(device)).to_not be
      expect(sequences_mow_all_weeds?(device)).to_not be
      expect(sequences_pick_from_seed_tray?(device)).to_not be
      expect(settings_default_map_size_x?(device)).to eq(2900)
      expect(settings_default_map_size_y?(device)).to eq(1200)
    end

    it "seeds accounts with Express XL 1.0 data" do
      start_tests "express_xl_1.0"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device)).to_not be
      expect(peripherals_peripheral_5?(device)).to_not be
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device)).to_not be
      expect(peripherals_rotary_tool_reverse?(device)).to_not be
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device)).to_not be
      expect(sensors_tool_verification?(device)).to_not be
      expect(settings_device_name?(device)).to eq(Names::EXPRESS_XL)
      expect(settings_change_firmware_config_defaults?(device)).to be(false)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(140)
      expect(settings_firmware?(device)).to eq("express_k10")
      expect(settings_hide_sensors?(device)).to be(true)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device)).to_not be
      expect(tool_slots_slot_4?(device)).to_not be
      expect(tool_slots_slot_5?(device)).to_not be
      expect(tool_slots_slot_6?(device)).to_not be
      expect(tool_slots_slot_7?(device)).to_not be
      expect(tool_slots_slot_8?(device)).to_not be
      expect(tool_slots_slot_9?(device)).to_not be

      check_slot_pairing(tool_slots_slot_1?(device), "Seed Trough 1")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Trough 2")

      expect(tools_seed_bin?(device)).to_not be
      expect(tools_seed_tray?(device)).to_not be
      expect(tools_seed_trough_1?(device)).to be
      expect(tools_seed_trough_2?(device)).to be
      expect(tools_seeder?(device)).to_not be
      expect(tools_soil_sensor?(device)).to_not be
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to_not be
      expect(tools_rotary?(device)).to_not be
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to_not be
      expect(sequences_dismount_tool?(device)).to_not be
      expect(sequences_mow_all_weeds?(device)).to_not be
      expect(sequences_pick_from_seed_tray?(device)).to_not be
      expect(settings_default_map_size_x?(device)).to eq(6000)
      expect(settings_default_map_size_y?(device)).to eq(2400)
    end

    it "seeds accounts with Express XL 1.1 data" do
      start_tests "express_xl_1.1"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device)).to_not be
      expect(peripherals_peripheral_5?(device)).to_not be
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device)).to_not be
      expect(peripherals_rotary_tool_reverse?(device)).to_not be
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device)).to_not be
      expect(sensors_tool_verification?(device)).to_not be
      expect(settings_device_name?(device)).to eq(Names::EXPRESS_XL)
      expect(settings_change_firmware_config_defaults?(device)).to be(false)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(140)
      expect(settings_firmware?(device)).to eq("express_k11")
      expect(settings_hide_sensors?(device)).to be(true)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device)).to_not be
      expect(tool_slots_slot_4?(device)).to_not be
      expect(tool_slots_slot_5?(device)).to_not be
      expect(tool_slots_slot_6?(device)).to_not be
      expect(tool_slots_slot_7?(device)).to_not be
      expect(tool_slots_slot_8?(device)).to_not be
      expect(tool_slots_slot_9?(device)).to_not be

      check_slot_pairing(tool_slots_slot_1?(device), "Seed Trough 1")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Trough 2")

      expect(tools_seed_bin?(device)).to_not be
      expect(tools_seed_tray?(device)).to_not be
      expect(tools_seed_trough_1?(device)).to be
      expect(tools_seed_trough_2?(device)).to be
      expect(tools_seeder?(device)).to_not be
      expect(tools_soil_sensor?(device)).to_not be
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to_not be
      expect(tools_rotary?(device)).to_not be
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to_not be
      expect(sequences_dismount_tool?(device)).to_not be
      expect(sequences_mow_all_weeds?(device)).to_not be
      expect(sequences_pick_from_seed_tray?(device)).to_not be
      expect(settings_default_map_size_x?(device)).to eq(6000)
      expect(settings_default_map_size_y?(device)).to eq(2400)
    end

    it "seeds accounts with Express XL 1.2 data" do
      start_tests "express_xl_1.2"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device)).to_not be
      expect(peripherals_peripheral_5?(device)).to_not be
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(peripherals_rotary_tool?(device)).to_not be
      expect(peripherals_rotary_tool_reverse?(device)).to_not be
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plant_count?(device)).to eq(0)
      expect(sensors_soil_sensor?(device)).to_not be
      expect(sensors_tool_verification?(device)).to_not be
      expect(settings_device_name?(device)).to eq(Names::EXPRESS_XL)
      expect(settings_change_firmware_config_defaults?(device)).to be(false)
      expect(settings_soil_height?(device)).to eq(-500)
      expect(settings_gantry_height?(device)).to eq(140)
      expect(settings_firmware?(device)).to eq("express_k12")
      expect(settings_hide_sensors?(device)).to be(true)
      expect(tool_slots_slot_1?(device).name).to eq("Slot")
      expect(tool_slots_slot_2?(device).name).to eq("Slot")
      expect(tool_slots_slot_3?(device)).to_not be
      expect(tool_slots_slot_4?(device)).to_not be
      expect(tool_slots_slot_5?(device)).to_not be
      expect(tool_slots_slot_6?(device)).to_not be
      expect(tool_slots_slot_7?(device)).to_not be
      expect(tool_slots_slot_8?(device)).to_not be
      expect(tool_slots_slot_9?(device)).to_not be

      check_slot_pairing(tool_slots_slot_1?(device), "Seed Trough 1")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Trough 2")

      expect(tools_seed_bin?(device)).to_not be
      expect(tools_seed_tray?(device)).to_not be
      expect(tools_seed_trough_1?(device)).to be
      expect(tools_seed_trough_2?(device)).to be
      expect(tools_seeder?(device)).to_not be
      expect(tools_soil_sensor?(device)).to_not be
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to_not be
      expect(tools_rotary?(device)).to_not be
      expect(sequences_pickup_seed?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(point_groups_spinach?(device)).to_not be
      expect(point_groups_broccoli?(device)).to_not be
      expect(point_groups_beet?(device)).to_not be
      expect(point_groups_all_plants?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_points?(device)).to be_kind_of(PointGroup)
      expect(point_groups_all_weeds?(device)).to be_kind_of(PointGroup)
      expect(sequences_find_home?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all_plants?(device)).to be_kind_of(Sequence)
      expect(sequences_water_all?(device)).to be_kind_of(Sequence)
      expect(sequences_photo_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_weed_detection_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_soil_height_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_grid?(device)).to be_kind_of(Sequence)
      expect(sequences_dispense_water?(device)).to be_kind_of(Sequence)
      expect(sequences_mount_tool?(device)).to_not be
      expect(sequences_dismount_tool?(device)).to_not be
      expect(sequences_mow_all_weeds?(device)).to_not be
      expect(sequences_pick_from_seed_tray?(device)).to_not be
      expect(settings_default_map_size_x?(device)).to eq(6000)
      expect(settings_default_map_size_y?(device)).to eq(2400)
    end

    it "seeds accounts with demo account data" do
      start_tests "genesis_1.7", true, true

      expect(plant_count?(device)).to eq(84)
      expect(point_groups_spinach?(device)).to be_kind_of(PointGroup)
      expect(point_groups_broccoli?(device)).to be_kind_of(PointGroup)
      expect(point_groups_beet?(device)).to be_kind_of(PointGroup)
    end

    it "seeds accounts with demo account data: XL" do
      start_tests "genesis_xl_1.7", true, true

      expect(plant_count?(device)).to eq(253)
      expect(point_groups_spinach?(device)).to be_kind_of(PointGroup)
      expect(point_groups_broccoli?(device)).to be_kind_of(PointGroup)
      expect(point_groups_beet?(device)).to be_kind_of(PointGroup)
    end

    it "seeds accounts when sequence versions not available: demo account" do
      start_tests "genesis_1.7", false, true

      expect(sequences_grid?(device)).to be_kind_of(Sequence)
    end

    it "seeds accounts when sequence versions not available:  Genesis XL 1.6" do
      start_tests "genesis_xl_1.6", false

      expect(sequences_mow_all_weeds?(device)).to be_kind_of(Sequence)
    end

    it "seeds accounts when sequence versions not available:  Genesis 1.6" do
      start_tests "genesis_1.6", false

      expect(sequences_mow_all_weeds?(device)).to be_kind_of(Sequence)
    end

    it "seeds accounts when sequence versions not available:  Genesis XL 1.7" do
      start_tests "genesis_xl_1.7", false

      expect(sequences_mow_all_weeds?(device)).to be_kind_of(Sequence)
    end

    it "seeds accounts when sequence versions not available:  Genesis 1.7" do
      start_tests "genesis_1.7", false

      expect(sequences_mow_all_weeds?(device)).to be_kind_of(Sequence)
    end

    it "does not seed accounts" do
      start_tests "none"

      expect(sequences_plant_seed?(device)).to_not be
    end
  end
end
