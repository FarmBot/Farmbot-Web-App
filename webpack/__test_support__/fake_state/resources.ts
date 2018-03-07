import { Everything } from "../../interfaces";
import { buildResourceIndex } from "../resource_index_builder";
import {
  TaggedFarmEvent, TaggedSequence, TaggedRegimen, TaggedImage,
  TaggedTool, TaggedToolSlotPointer, TaggedUser, TaggedWebcamFeed,
  TaggedPlantPointer, TaggedGenericPointer, TaggedPeripheral, TaggedFbosConfig,
  TaggedWebAppConfig,
  TaggedSensor
} from "../../resources/tagged_resources";
import { ExecutableType } from "../../farm_designer/interfaces";
import { fakeResource } from "../fake_resource";

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

export function fakeToolSlot(): TaggedToolSlotPointer {
  return fakeResource("Point", {
    name: "ToolSlot 1",
    pointer_type: "ToolSlot",
    tool_id: 1,
    x: 10,
    y: 10,
    z: 10,
    radius: 10,
    meta: {},
    pullout_direction: 0
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

export function fakeSensor(): TaggedSensor {
  return fakeResource("Sensor", {
    id: idCounter++,
    label: "Fake Pin",
    mode: 0,
    pin: 1
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
    discard_unsaved: false
  });
}
