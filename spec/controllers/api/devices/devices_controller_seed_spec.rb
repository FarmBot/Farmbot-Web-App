require "spec_helper"

describe Api::DevicesController do
  include Devise::Test::ControllerHelpers

  let(:user) { FactoryBot.create(:user) }
  let(:device) { user.device }

  describe "#seed" do
    periph_names = [
      Devices::Seeders::Constants::ToolNames::VACUUM,
      Devices::Seeders::Constants::ToolNames::WATER,
    ].sort

    sensor_names = [
      Devices::Seeders::Constants::ToolNames::SOIL_SENSOR,
      Devices::Seeders::Constants::ToolNames::TOOL_VERIFICATION,
    ].sort

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

    def pin_bindings_button_1?(device)
      device.pin_bindings.find_by(pin_num: 16)
    end

    def pin_bindings_button_2?(device)
      device.pin_bindings.find_by(pin_num: 22)
    end

    def plants?(device)
      device.plants.count == 11
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

    def settings_map_xl?(device)
      device.web_app_config.map_xl
    end

    def settings_enable_encoders?(device)
      c = device.firmware_config

      return c.encoder_enabled_x != 0 &&
               c.encoder_enabled_y != 0 &&
               c.encoder_enabled_z != 0
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

    def tools_seed_trough_3?(device)
      device.tools.find_by(name: "Seed Trough 3")
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

    def sequences_mount_tool?(device)
      device.sequences.find_by(name: "Mount tool")
    end

    def sequences_pickup_seed_genesis?(device)
      device.sequences.find_by(name: "Pick up seed (Genesis)")
    end

    def sequences_pickup_seed_express?(device)
      device.sequences.find_by(name: "Pick up seed (Express)")
    end

    def sequences_plant_seed?(device)
      device.sequences.find_by(name: "Plant seed")
    end

    def sequences_take_photo_of_plant?(device)
      device.sequences.find_by(name: "Take photo of plant")
    end

    def sequences_tool_error?(device)
      device.sequences.find_by(name: "Tool error")
    end

    def sequences_unmount_tool?(device)
      device.sequences.find_by(name: "Unmount tool")
    end

    def sequences_water_plant?(device)
      device.sequences.find_by(name: "Water plant")
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
      run_jobs_now do
        post :seed, params: { product_line: "none" }
      end
      expect(response.status).to eq(200)
      expect(device.plants.count).to eq(0)
      expect(device.reload.name).to eq(old_name)
    end

    def start_tests(product_line)
      sign_in user
      run_jobs_now { post :seed, params: { product_line: product_line } }
      expect(response.status).to eq(200)
      device.reload
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
      expect(pin_bindings_button_1?(device)).to_not be
      expect(pin_bindings_button_2?(device)).to_not be
      expect(plants?(device)).to be true
      expect(sensors_soil_sensor?(device)).to be_kind_of(Sensor)
      expect(sensors_tool_verification?(device)).to be_kind_of(Sensor)
      expect(settings_device_name?(device)).to eq("FarmBot Genesis")
      expect(settings_enable_encoders?(device)).to be(true)
      expect(settings_firmware?(device)).to eq("arduino")
      expect(settings_map_xl?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Seeder")
      expect(tool_slots_slot_2?(device).name).to eq("Seed Bin")
      expect(tool_slots_slot_3?(device).name).to eq("Seed Tray")
      expect(tool_slots_slot_4?(device).name).to eq("Watering Nozzle")
      expect(tool_slots_slot_5?(device).name).to eq("Soil Sensor")
      expect(tool_slots_slot_6?(device).name).to eq("Weeder")
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
      expect(tools_seed_trough_3?(device)).to_not be
      expect(tools_seeder?(device)).to be_kind_of(Tool)
      expect(tools_soil_sensor?(device)).to be_kind_of(Tool)
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to be_kind_of(Tool)
      expect(sequences_mount_tool?(device)).to be
      expect(sequences_pickup_seed_genesis?(device)).to be
      expect(sequences_pickup_seed_express?(device)).to_not be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_tool_error?(device)).to be_kind_of(Sequence)
      expect(sequences_unmount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(2900)
      expect(settings_default_map_size_y?(device)).to eq(1400)
    end

    it "seeds accounts with Genesis 1.3 data" do
      start_tests "genesis_1.3"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device).pin).to eq(10)
      expect(peripherals_peripheral_5?(device).pin).to eq(12)
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(pin_bindings_button_1?(device)).to_not be
      expect(pin_bindings_button_2?(device)).to_not be
      expect(plants?(device)).to be true
      expect(sensors_soil_sensor?(device).pin).to eq(59)
      expect(sensors_tool_verification?(device).pin).to eq(63)
      expect(settings_device_name?(device)).to eq("FarmBot Genesis")
      expect(settings_enable_encoders?(device)).to be(true)
      expect(settings_firmware?(device)).to eq("farmduino")
      expect(settings_map_xl?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Seeder")
      expect(tool_slots_slot_2?(device).name).to eq("Seed Bin")
      expect(tool_slots_slot_3?(device).name).to eq("Seed Tray")
      expect(tool_slots_slot_4?(device).name).to eq("Watering Nozzle")
      expect(tool_slots_slot_5?(device).name).to eq("Soil Sensor")
      expect(tool_slots_slot_6?(device).name).to eq("Weeder")

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
      expect(tools_seed_trough_3?(device)).to_not be
      expect(tools_seeder?(device)).to be_kind_of(Tool)
      expect(tools_soil_sensor?(device)).to be_kind_of(Tool)
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to be_kind_of(Tool)
      expect(sequences_mount_tool?(device)).to be
      expect(sequences_pickup_seed_genesis?(device)).to be
      expect(sequences_pickup_seed_express?(device)).to_not be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_tool_error?(device)).to be_kind_of(Sequence)
      expect(sequences_unmount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(2900)
      expect(settings_default_map_size_y?(device)).to eq(1400)
    end

    it "seeds accounts with Genesis 1.4 data" do
      start_tests "genesis_1.4"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device).pin).to eq(10)
      expect(peripherals_peripheral_5?(device).pin).to eq(12)
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plants?(device)).to be true
      expect(sensors_soil_sensor?(device).pin).to eq(59)
      expect(sensors_tool_verification?(device).pin).to eq(63)
      expect(settings_device_name?(device)).to eq("FarmBot Genesis")
      expect(settings_enable_encoders?(device)).to be(true)
      expect(settings_firmware?(device)).to eq("farmduino_k14")
      expect(settings_map_xl?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Seeder")
      expect(tool_slots_slot_2?(device).name).to eq("Seed Bin")
      expect(tool_slots_slot_3?(device).name).to eq("Seed Tray")
      expect(tool_slots_slot_4?(device).name).to eq("Watering Nozzle")
      expect(tool_slots_slot_5?(device).name).to eq("Soil Sensor")
      expect(tool_slots_slot_6?(device).name).to eq("Weeder")
      expect(tools_seed_bin?(device)).to be
      expect(tools_seed_tray?(device)).to be
      expect(tools_seed_trough_1?(device)).to_not be
      expect(tools_seed_trough_2?(device)).to_not be
      expect(tools_seed_trough_3?(device)).to_not be
      expect(tools_seeder?(device)).to be_kind_of(Tool)
      expect(tools_soil_sensor?(device)).to be_kind_of(Tool)
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to be_kind_of(Tool)
      expect(sequences_mount_tool?(device)).to be
      expect(sequences_pickup_seed_genesis?(device)).to be
      expect(sequences_pickup_seed_express?(device)).to_not be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_tool_error?(device)).to be_kind_of(Sequence)
      expect(sequences_unmount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(2900)
      expect(settings_default_map_size_y?(device)).to eq(1400)
    end

    it "seeds accounts with Genesis XL 1.4 data" do
      start_tests "genesis_xl_1.4"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device).pin).to eq(10)
      expect(peripherals_peripheral_5?(device).pin).to eq(12)
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plants?(device)).to be true
      expect(sensors_soil_sensor?(device).pin).to eq(59)
      expect(sensors_tool_verification?(device).pin).to eq(63)
      expect(settings_device_name?(device)).to eq("FarmBot Genesis XL")
      expect(settings_enable_encoders?(device)).to be(true)
      expect(settings_firmware?(device)).to eq("farmduino_k14")
      expect(settings_map_xl?(device)).to be(true)
      expect(tool_slots_slot_1?(device).name).to eq("Seeder")
      expect(tool_slots_slot_2?(device).name).to eq("Seed Bin")
      expect(tool_slots_slot_3?(device).name).to eq("Seed Tray")
      expect(tool_slots_slot_4?(device).name).to eq("Watering Nozzle")
      expect(tool_slots_slot_5?(device).name).to eq("Soil Sensor")
      expect(tool_slots_slot_6?(device).name).to eq("Weeder")

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
      expect(tools_seed_trough_3?(device)).to_not be
      expect(tools_seeder?(device)).to be_kind_of(Tool)
      expect(tools_soil_sensor?(device)).to be_kind_of(Tool)
      expect(tools_watering_nozzle?(device)).to be_kind_of(Tool)
      expect(tools_weeder?(device)).to be_kind_of(Tool)
      expect(sequences_mount_tool?(device)).to be
      expect(sequences_pickup_seed_genesis?(device)).to be
      expect(sequences_pickup_seed_express?(device)).to_not be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_tool_error?(device)).to be_kind_of(Sequence)
      expect(sequences_unmount_tool?(device)).to be_kind_of(Sequence)
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(5900)
      expect(settings_default_map_size_y?(device)).to eq(2900)
    end

    it "seeds accounts with Express 1.0 data" do
      start_tests "express_1.0"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device).pin).to eq(10)
      expect(peripherals_peripheral_5?(device).pin).to eq(12)
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plants?(device)).to be true
      expect(sensors_soil_sensor?(device)).to_not be
      expect(sensors_tool_verification?(device)).to_not be
      expect(settings_device_name?(device)).to eq("FarmBot Express")
      expect(settings_enable_encoders?(device)).to be(false)
      expect(settings_firmware?(device)).to eq("express_k10")
      expect(settings_map_xl?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Seed Trough 1")
      expect(tool_slots_slot_2?(device).name).to eq("Seed Trough 2")
      expect(tool_slots_slot_3?(device).name).to eq("Seed Trough 3")
      expect(tool_slots_slot_4?(device)).to_not be
      expect(tool_slots_slot_5?(device)).to_not be
      expect(tool_slots_slot_6?(device)).to_not be
      check_slot_pairing(tool_slots_slot_1?(device), "Seed Trough 1")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Trough 2")
      check_slot_pairing(tool_slots_slot_3?(device), "Seed Trough 3")
      expect(tools_seed_bin?(device)).to_not be
      expect(tools_seed_tray?(device)).to_not be
      expect(tools_seed_trough_1?(device)).to be
      expect(tools_seed_trough_2?(device)).to be
      expect(tools_seed_trough_3?(device)).to be
      expect(tools_seeder?(device)).to_not be
      expect(tools_soil_sensor?(device)).to_not be
      expect(tools_watering_nozzle?(device)).to_not be
      expect(tools_weeder?(device)).to_not be
      expect(sequences_mount_tool?(device)).to_not be
      expect(sequences_pickup_seed_genesis?(device)).to_not be
      expect(sequences_pickup_seed_express?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_tool_error?(device)).to_not be
      expect(sequences_unmount_tool?(device)).to_not be
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(2900)
      expect(settings_default_map_size_y?(device)).to eq(1200)
    end

    it "seeds accounts with Express XL 1.0 data" do
      start_tests "express_xl_1.0"

      expect(peripherals_lighting?(device).pin).to eq(7)
      expect(peripherals_peripheral_4?(device).pin).to eq(10)
      expect(peripherals_peripheral_5?(device).pin).to eq(12)
      expect(peripherals_vacuum?(device).pin).to be(9)
      expect(peripherals_water?(device).pin).to be(8)
      expect(pin_bindings_button_1?(device).special_action).to eq("emergency_lock")
      expect(pin_bindings_button_2?(device).special_action).to eq("emergency_unlock")
      expect(plants?(device)).to be true
      expect(sensors_soil_sensor?(device)).to_not be
      expect(sensors_tool_verification?(device)).to_not be
      expect(settings_device_name?(device)).to eq("FarmBot Express XL")
      expect(settings_enable_encoders?(device)).to be(false)
      expect(settings_firmware?(device)).to eq("express_k10")
      expect(settings_map_xl?(device)).to be(false)
      expect(tool_slots_slot_1?(device).name).to eq("Seed Trough 1")
      expect(tool_slots_slot_2?(device).name).to eq("Seed Trough 2")
      expect(tool_slots_slot_3?(device).name).to eq("Seed Trough 3")
      expect(tool_slots_slot_4?(device)).to_not be
      expect(tool_slots_slot_5?(device)).to_not be
      expect(tool_slots_slot_6?(device)).to_not be
      check_slot_pairing(tool_slots_slot_1?(device), "Seed Trough 1")
      check_slot_pairing(tool_slots_slot_2?(device), "Seed Trough 2")
      check_slot_pairing(tool_slots_slot_3?(device), "Seed Trough 3")
      expect(tools_seed_bin?(device)).to_not be
      expect(tools_seed_tray?(device)).to_not be
      expect(tools_seed_trough_1?(device)).to be
      expect(tools_seed_trough_2?(device)).to be
      expect(tools_seed_trough_3?(device)).to be
      expect(tools_seeder?(device)).to_not be
      expect(tools_soil_sensor?(device)).to_not be
      expect(tools_watering_nozzle?(device)).to_not be
      expect(tools_weeder?(device)).to_not be
      expect(sequences_mount_tool?(device)).to_not be
      expect(sequences_pickup_seed_genesis?(device)).to_not be
      expect(sequences_pickup_seed_express?(device)).to be
      expect(sequences_plant_seed?(device)).to be_kind_of(Sequence)
      expect(sequences_take_photo_of_plant?(device)).to be_kind_of(Sequence)
      expect(sequences_tool_error?(device)).to_not be
      expect(sequences_unmount_tool?(device)).to_not be
      expect(sequences_water_plant?(device)).to be_kind_of(Sequence)
      expect(settings_default_map_size_x?(device)).to eq(6000)
      expect(settings_default_map_size_y?(device)).to eq(2400)
    end
  end
end
