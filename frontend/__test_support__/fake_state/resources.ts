import { Everything } from "../../interfaces";
import { buildResourceIndex } from "../resource_index_builder";
import {
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
  TaggedToolSlotPointer,
  TaggedFarmwareEnv,
  TaggedFarmwareInstallation,
  TaggedAlert,
  TaggedFolder,
  TaggedWeedPointer,
  TaggedWizardStepResult,
  TaggedTelemetry,
  TaggedCurve,
} from "farmbot";
import { fakeResource } from "../fake_resource";
import {
  ExecutableType, PinBindingType, Folder,
} from "farmbot/dist/resources/api_resources";
import { MessageType } from "../../sequences/interfaces";
import { TaggedPointGroup } from "../../resources/interfaces";

export const resources: Everything["resources"] = buildResourceIndex();
let idCounter = 1;

export const fakeSequence =
  (body: Partial<TaggedSequence["body"]> = {}): TaggedSequence => {
    return fakeResource("Sequence", {
      args: {
        version: 4,
        locals: { kind: "scope_declaration", args: {} },
      },
      id: idCounter++,
      color: "red",
      folder_id: undefined,
      name: "fake",
      description: "description",
      forked: false,
      kind: "sequence",
      pinned: false,
      body: [],
      ...body
    });
  };

export function fakeFolder(input: Partial<Folder> = {}): TaggedFolder {
  return fakeResource("Folder", {
    id: idCounter++,
    color: "red",
    parent_id: undefined,
    name: "fake",
    ...input
  });
}

export function fakeRegimen(): TaggedRegimen {
  return fakeResource("Regimen", {
    name: "Foo",
    color: "red",
    regimen_items: [],
    body: [],
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
  });
}

export function fakeLog(): TaggedLog {
  return fakeResource("Log", {
    id: idCounter++,
    message: "Farmbot is up and Running!",
    type: MessageType.info,
    x: 1,
    y: 2,
    z: 3,
    verbosity: 1,
    major_version: 5,
    minor_version: 1,
    // patch_version: 1,
    channels: ["toast"],
    created_at: 1501703421
  });
}

export function fakeImage(): TaggedImage {
  return fakeResource("Image", {
    id: idCounter++,
    device_id: idCounter++,
    attachment_processed_at: undefined,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    attachment_url: "https://i.redd.it/xz0e2kinm4cz.jpg",
    meta: { x: 0, y: 0, z: 0 }
  });
}

export function fakeTool(): TaggedTool {
  return fakeResource("Tool", {
    name: "Foo",
    flow_rate_ml_per_s: 0,
  });
}

export function fakeUser(): TaggedUser {
  return fakeResource("User", {
    id: idCounter++,
    name: "Fake User 123",
    email: "fake@fake.com",
    language: "English",
    created_at: "---",
    updated_at: "---"
  });
}

export function fakeToolSlot(): TaggedToolSlotPointer {
  return fakeResource("Point", {
    x: 0,
    y: 0,
    z: 0,
    pointer_type: "ToolSlot",
    meta: {},
    tool_id: undefined,
    name: "Tool Slot",
    pullout_direction: 0,
    gantry_mounted: false,
  });
}

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
    depth: 0,
    meta: {},
    openfarm_slug: "strawberry"
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

export function fakeWeed(): TaggedWeedPointer {
  return fakeResource("Point", {
    id: idCounter++,
    name: "Weed 1",
    pointer_type: "Weed",
    x: 200,
    y: 400,
    z: 0,
    radius: 100,
    plant_stage: "active",
    meta: { created_by: "plant-detection", color: "red" }
  });
}

export function fakeSavedGarden(): TaggedSavedGarden {
  return fakeResource("SavedGarden", {
    id: idCounter++,
    name: "Saved Garden 1",
  });
}

export function fakePlantTemplate(): TaggedPlantTemplate {
  return fakeResource("PlantTemplate", {
    id: idCounter++,
    saved_garden_id: idCounter++,
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

export function fakeWizardStepResult(): TaggedWizardStepResult {
  const id = idCounter++;
  return fakeResource("WizardStepResult", {
    id,
    created_at: "2018-01-11T20:20:38.362Z",
    updated_at: "2018-01-11T20:20:38.362Z",
    slug: "step",
    answer: false,
    outcome: "error",
  });
}

export function fakeTelemetry(): TaggedTelemetry {
  const id = idCounter++;
  return fakeResource("Telemetry", {
    id,
    created_at: 1501703421,
    updated_at: "2018-01-11T20:20:38.362Z",
    target: "rpi",
    soc_temp: 0,
    throttled: "0x0",
    wifi_level_percent: 0,
    uptime: 0,
    memory_usage: 0,
    disk_usage: 0,
    cpu_usage: 0,
    fbos_version: "0.0.0",
    firmware_hardware: "arduino",
  });
}

export function fakePinBinding(): TaggedPinBinding {
  return fakeResource("PinBinding", {
    id: idCounter++,
    pin_num: 10,
    sequence_id: idCounter++,
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
    read_at: "2018-01-11T20:20:38.362Z",
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
    pin: 1,
    mode: 0,
  });
}

export function fakeFbosConfig(): TaggedFbosConfig {
  return fakeResource("FbosConfig", {
    id: idCounter++,
    device_id: idCounter++,
    created_at: "",
    updated_at: "",
    firmware_input_log: false,
    firmware_output_log: false,
    sequence_body_log: false,
    sequence_complete_log: false,
    sequence_init_log: false,
    firmware_hardware: "arduino",
    os_auto_update: false,
    arduino_debug_messages: false
  });
}

export function fakeWebAppConfig(): TaggedWebAppConfig {
  return fakeResource("WebAppConfig", {
    id: idCounter++,
    device_id: idCounter++,
    created_at: "2018-01-11T20:20:38.362Z",
    updated_at: "2018-01-22T15:32:41.970Z",
    assertion_log: 1,
    confirm_plant_deletion: true,
    confirm_step_deletion: false,
    confirm_sequence_deletion: true,
    crop_images: false,
    clip_image_layer: false,
    disable_animations: false,
    disable_i18n: false,
    display_map_missed_steps: false,
    display_trail: false,
    dynamic_map: false,
    enable_3d_electronics_box_top: true,
    encoder_figure: false,
    go_button_axes: "XY",
    hide_webcam_widget: false,
    highlight_modified_settings: false,
    landing_page: "controls",
    legend_menu_open: false,
    raw_encoders: true,
    scaled_encoders: true,
    show_advanced_settings: true,
    show_spread: false,
    show_farmbot: true,
    show_images: false,
    show_sensor_readings: false,
    show_moisture_interpolation_map: false,
    show_plants: true,
    show_points: true,
    show_soil_interpolation_map: false,
    show_weeds: true,
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
    expand_step_options: false,
    hide_sensors: false,
    enable_browser_speak: false,
    beep_verbosity: 0,
    photo_filter_begin: "2018-01-11T20:20:38.362Z",
    photo_filter_end: "2018-01-22T15:32:41.970Z",
    discard_unsaved: false,
    discard_unsaved_sequences: false,
    xy_swap: false,
    home_button_homing: false,
    show_motor_plot: false,
    show_missed_step_plot: false,
    show_historic_points: false,
    time_format_24_hour: false,
    time_format_seconds: false,
    show_pins: false,
    show_zones: false,
    show_camera_view_area: false,
    show_uncropped_camera_view_area: false,
    default_plant_depth: 5,
    disable_emergency_unlock_confirmation: false,
    map_size_x: 2900,
    map_size_y: 1400,
    user_interface_read_only_mode: false,
    view_celery_script: false,
  });
}

export function fakeFirmwareConfig(): TaggedFirmwareConfig {
  return fakeResource("FirmwareConfig", {
    id: idCounter++,
    device_id: idCounter++,
    created_at: "",
    updated_at: "",
    encoder_enabled_x: 1,
    encoder_enabled_y: 1,
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
    movement_axis_stealth_x: 0,
    movement_axis_stealth_y: 0,
    movement_axis_stealth_z: 0,
    movement_calibration_deadzone_x: 50,
    movement_calibration_deadzone_y: 50,
    movement_calibration_deadzone_z: 250,
    movement_calibration_retry_x: 3,
    movement_calibration_retry_y: 3,
    movement_calibration_retry_z: 3,
    movement_calibration_retry_total_x: 10,
    movement_calibration_retry_total_y: 10,
    movement_calibration_retry_total_z: 10,
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
    movement_invert_2_endpoints_x: 0,
    movement_invert_2_endpoints_y: 0,
    movement_invert_2_endpoints_z: 0,
    movement_invert_motor_x: 0,
    movement_invert_motor_y: 0,
    movement_invert_motor_z: 0,
    movement_keep_active_x: 0,
    movement_keep_active_y: 0,
    movement_keep_active_z: 1,
    movement_max_spd_x: 400,
    movement_max_spd_y: 400,
    movement_max_spd_z: 400,
    movement_max_spd_z2: 400,
    movement_min_spd_x: 50,
    movement_min_spd_y: 50,
    movement_min_spd_z: 50,
    movement_min_spd_z2: 50,
    movement_secondary_motor_invert_x: 1,
    movement_secondary_motor_x: 1,
    movement_step_per_mm_x: 5,
    movement_step_per_mm_y: 5,
    movement_step_per_mm_z: 25,
    movement_microsteps_x: 1,
    movement_microsteps_y: 1,
    movement_microsteps_z: 1,
    movement_motor_current_x: 600,
    movement_motor_current_y: 600,
    movement_motor_current_z: 600,
    movement_stall_sensitivity_x: 30,
    movement_stall_sensitivity_y: 30,
    movement_stall_sensitivity_z: 30,
    movement_steps_acc_dec_x: 300,
    movement_steps_acc_dec_y: 300,
    movement_steps_acc_dec_z: 300,
    movement_steps_acc_dec_z2: 300,
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
    pin_report_1_pin_nr: 0,
    pin_report_2_pin_nr: 0,
  });
}

export function fakeFarmwareEnv(): TaggedFarmwareEnv {
  return fakeResource("FarmwareEnv", {
    key: "fake_FarmwareEnv_key",
    value: "fake_FarmwareEnv_value"
  });
}

export function fakeFarmwareInstallation(): TaggedFarmwareInstallation {
  return fakeResource("FarmwareInstallation", {
    url: "https://",
    package: undefined,
    package_error: undefined,
  });
}

export function fakeAlert(): TaggedAlert {
  return fakeResource("Alert", {
    slug: "slug",
    created_at: 123,
    problem_tag: "api.noun.verb",
    priority: 100,
  });
}

export function fakePointGroup(): TaggedPointGroup {
  return fakeResource("PointGroup", {
    name: "Fake",
    sort_type: "xy_ascending",
    point_ids: [],
    criteria: {
      day: { op: "<", days_ago: 0 },
      number_eq: {},
      number_gt: {},
      number_lt: {},
      string_eq: {}
    },
    member_count: 0,
  });
}

export function fakeCurve(): TaggedCurve {
  return fakeResource("Curve", {
    name: "Fake",
    type: "water",
    data: { 1: 0, 2: 1 },
  });
}
