import { Everything } from "../../interfaces";
import { buildResourceIndex } from "../resource_index_builder";
import {
  TaggedDiagnosticDump,
  TaggedFarmEvent,
  TaggedFbosConfig,
  TaggedFirmwareConfig,
  TaggedGenericPointer,
  TaggedImage,
  TaggedLog,
  TaggedPeripheral,
  TaggedPinBinding,
  TaggedPlantPointer,
  TaggedRegimen,
  TaggedSensor,
  TaggedSensorReading,
  TaggedSequence,
  TaggedTool,
  TaggedUser,
  TaggedWebAppConfig,
  TaggedWebcamFeed,
  TaggedSavedGarden,
  TaggedPlantTemplate,
} from "farmbot";
import { ExecutableType } from "../../farm_designer/interfaces";
import { fakeResource } from "../fake_resource";
import { emptyToolSlot } from "../../tools/components/empty_tool_slot";
import { FirmwareConfig } from "../../config_storage/firmware_configs";
import { PinBindingType } from "../../devices/pin_bindings/interfaces";

export let resources: Everything["resources"] = buildResourceIndex();
let idCounter = 1;

export function fakeSequence(): TaggedSequence {
  return fakeResource("Sequence", {
    args: {
      version: 4,
      label: "WIP",
      locals: { kind: "scope_declaration", args: {} },
    },
    id: 12,
    color: "red",
    name: "fake",
    kind: "sequence",
    body: []
  });
}

export function fakeRegimen(): TaggedRegimen {
  return fakeResource("Regimen", {
    name: "Foo",
    color: "red",
    regimen_items: []
  });
}

export function fakeFarmEvent(exe_type: ExecutableType,
  exe_id: number): TaggedFarmEvent {
  return fakeResource("FarmEvent", {
    "id": 21,
    "start_time": "2017-05-22T05:00:00.000Z",
    "end_time": "2017-05-30T05:00:00.000Z",
    "repeat": 1,
    "time_unit": "never",
    "executable_id": exe_id,
    "executable_type": exe_type,
    "calendar": []
  });
}

export function fakeLog(): TaggedLog {
  return fakeResource("Log", {
    id: idCounter++,
    message: "Farmbot is up and Running!",
    type: "info",
    x: 1,
    y: 2,
    z: 3,
    verbosity: 1,
    major_version: 5,
    minor_version: 1,
    channels: ["toast"],
    created_at: 1501703421
  });
}

export function fakeImage(): TaggedImage {
  return fakeResource("Image", {
    id: idCounter++,
    device_id: 46,
    attachment_processed_at: undefined,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    attachment_url: "https://i.redd.it/xz0e2kinm4cz.jpg",
    meta: { x: 0, y: 0, z: 0 }
  });
}

export function fakeTool(): TaggedTool {
  return fakeResource("Tool", {
    name: "Foo"
  });
}

export function fakeUser(): TaggedUser {
  return fakeResource("User", {
    id: idCounter++,
    device_id: 789,
    name: "Fake User 123",
    email: "fake@fake.com",
    created_at: "---",
    updated_at: "---"
  });
}

export const fakeToolSlot = emptyToolSlot;

export function fakePlant(): TaggedPlantPointer {
  return fakeResource("Point", {
    id: idCounter++,
    name: "Strawberry Plant 1",
    pointer_type: "Plant",
    plant_stage: "planned",
    x: 100,
    y: 200,
    z: 0,
    radius: 25,
    meta: {},
    openfarm_slug: "strawberry"
  });
}

export function fakeDiagnosticDump(): TaggedDiagnosticDump {
  const string = "----PLACEHOLDER DIAG STUFF ---";
  return fakeResource("DiagnosticDump", {
    id: idCounter++,
    device_id: 123,
    ticket_identifier: string,
    fbos_commit: string,
    fbos_version: string,
    firmware_commit: string,
    firmware_state: string,
    network_interface: string,
    fbos_dmesg_dump: string,
    created_at: string,
    updated_at: string,
  });
}

export function fakePoint(): TaggedGenericPointer {
  return fakeResource("Point", {
    id: idCounter++,
    name: "Point 1",
    pointer_type: "GenericPointer",
    x: 200,
    y: 400,
    z: 0,
    radius: 100,
    meta: { created_by: "plant-detection" }
  });
}

export function fakeSavedGarden(): TaggedSavedGarden {
  return fakeResource("SavedGarden", {
    id: 1,
    name: "Saved Garden 1",
  });
}

export function fakePlantTemplate(): TaggedPlantTemplate {
  return fakeResource("PlantTemplate", {
    id: idCounter++,
    saved_garden_id: 1,
    radius: 50,
    x: 100,
    y: 200,
    z: 0,
    name: "Plant Template 1",
    openfarm_slug: "mint",
  });
}

export function fakeWebcamFeed(): TaggedWebcamFeed {
  const id = idCounter++;
  return fakeResource("WebcamFeed", {
    id,
    created_at: "---",
    updated_at: "---",
    url: "http://i.imgur.com/iAOUmEB.jpg",
    name: "wcf #" + id
  });
}

export function fakePinBinding(): TaggedPinBinding {
  return fakeResource("PinBinding", {
    id: idCounter++,
    pin_num: 10,
    sequence_id: 1,
    binding_type: PinBindingType.standard,
  });
}

export function fakeSensor(): TaggedSensor {
  return fakeResource("Sensor", {
    id: idCounter++,
    label: "Fake Pin",
    mode: 0,
    pin: 1
  });
}

export function fakeSensorReading(): TaggedSensorReading {
  return fakeResource("SensorReading", {
    id: idCounter++,
    created_at: "2018-01-11T20:20:38.362Z",
    pin: 1,
    value: 0,
    mode: 0,
    x: 10,
    y: 20,
    z: 30,
  });
}

export function fakePeripheral(): TaggedPeripheral {
  return fakeResource("Peripheral", {
    id: ++idCounter,
    label: "Fake Pin",
    pin: 1
  });
}

export function fakeFbosConfig(): TaggedFbosConfig {
  return fakeResource("FbosConfig", {
    id: 1,
    device_id: 1,
    created_at: "",
    updated_at: "",
    auto_sync: false,
    beta_opt_in: false,
    disable_factory_reset: false,
    firmware_input_log: false,
    firmware_output_log: false,
    sequence_body_log: false,
    sequence_complete_log: false,
    sequence_init_log: false,
    network_not_found_timer: 0,
    firmware_hardware: "arduino",
    api_migrated: false,
    os_auto_update: false,
    arduino_debug_messages: false
  });
}

export function fakeWebAppConfig(): TaggedWebAppConfig {
  return fakeResource("WebAppConfig", {
    id: 1,
    device_id: 1,
    created_at: "2018-01-11T20:20:38.362Z",
    updated_at: "2018-01-22T15:32:41.970Z",
    confirm_step_deletion: false,
    disable_animations: false,
    disable_i18n: false,
    display_trail: false,
    dynamic_map: false,
    encoder_figure: false,
    hide_webcam_widget: false,
    legend_menu_open: false,
    map_xl: false,
    raw_encoders: true,
    scaled_encoders: true,
    show_spread: false,
    show_farmbot: true,
    show_images: false,
    show_plants: true,
    show_points: true,
    x_axis_inverted: false,
    y_axis_inverted: false,
    z_axis_inverted: true,
    bot_origin_quadrant: 2,
    zoom_level: -3,
    success_log: 3,
    busy_log: 3,
    warn_log: 3,
    error_log: 3,
    info_log: 3,
    fun_log: 3,
    debug_log: 3,
    stub_config: false,
    show_first_party_farmware: false,
    enable_browser_speak: false,
    photo_filter_begin: "2018-01-11T20:20:38.362Z",
    photo_filter_end: "2018-01-22T15:32:41.970Z",
    discard_unsaved: false,
    xy_swap: false,
    home_button_homing: false,
  });
}

export function fakeFirmwareConfig(): TaggedFirmwareConfig {
  return fakeResource("FirmwareConfig", {
    device_id: 1,
    created_at: "",
    updated_at: "",
    encoder_enabled_x: 0,
    encoder_enabled_y: 0,
    encoder_enabled_z: 0,
    encoder_invert_x: 0,
    encoder_invert_y: 0,
    encoder_invert_z: 0,
    encoder_missed_steps_decay_x: 5,
    encoder_missed_steps_decay_y: 5,
    encoder_missed_steps_decay_z: 5,
    encoder_missed_steps_max_x: 5,
    encoder_missed_steps_max_y: 5,
    encoder_missed_steps_max_z: 5,
    encoder_scaling_x: 56,
    encoder_scaling_y: 56,
    encoder_scaling_z: 56,
    encoder_type_x: 0,
    encoder_type_y: 0,
    encoder_type_z: 0,
    encoder_use_for_pos_x: 0,
    encoder_use_for_pos_y: 0,
    encoder_use_for_pos_z: 0,
    movement_axis_nr_steps_x: 0,
    movement_axis_nr_steps_y: 0,
    movement_axis_nr_steps_z: 0,
    movement_enable_endpoints_x: 0,
    movement_enable_endpoints_y: 0,
    movement_enable_endpoints_z: 0,
    movement_home_at_boot_x: 0,
    movement_home_at_boot_y: 0,
    movement_home_at_boot_z: 0,
    movement_home_spd_x: 50,
    movement_home_spd_y: 50,
    movement_home_spd_z: 50,
    movement_home_up_x: 0,
    movement_home_up_y: 0,
    movement_home_up_z: 1,
    movement_invert_endpoints_x: 0,
    movement_invert_endpoints_y: 0,
    movement_invert_endpoints_z: 0,
    movement_invert_motor_x: 0,
    movement_invert_motor_y: 0,
    movement_invert_motor_z: 0,
    movement_keep_active_x: 0,
    movement_keep_active_y: 0,
    movement_keep_active_z: 1,
    movement_max_spd_x: 400,
    movement_max_spd_y: 400,
    movement_max_spd_z: 400,
    movement_min_spd_x: 50,
    movement_min_spd_y: 50,
    movement_min_spd_z: 50,
    movement_secondary_motor_invert_x: 1,
    movement_secondary_motor_x: 1,
    movement_step_per_mm_x: 5,
    movement_step_per_mm_y: 5,
    movement_step_per_mm_z: 25,
    movement_steps_acc_dec_x: 300,
    movement_steps_acc_dec_y: 300,
    movement_steps_acc_dec_z: 300,
    movement_stop_at_home_x: 0,
    movement_stop_at_home_y: 0,
    movement_stop_at_home_z: 0,
    movement_stop_at_max_x: 0,
    movement_stop_at_max_y: 0,
    movement_stop_at_max_z: 0,
    movement_timeout_x: 120,
    movement_timeout_y: 120,
    movement_timeout_z: 120,
    param_config_ok: 0,
    param_e_stop_on_mov_err: 0,
    param_mov_nr_retry: 3,
    param_test: 0,
    param_use_eeprom: 1,
    param_version: 1,
    pin_guard_1_active_state: 1,
    pin_guard_1_pin_nr: 0,
    pin_guard_1_time_out: 60,
    pin_guard_2_active_state: 1,
    pin_guard_2_pin_nr: 0,
    pin_guard_2_time_out: 60,
    pin_guard_3_active_state: 1,
    pin_guard_3_pin_nr: 0,
    pin_guard_3_time_out: 60,
    pin_guard_4_active_state: 1,
    pin_guard_4_pin_nr: 0,
    pin_guard_4_time_out: 60,
    pin_guard_5_active_state: 1,
    pin_guard_5_pin_nr: 0,
    pin_guard_5_time_out: 60,
    api_migrated: false
  } as FirmwareConfig);
}
