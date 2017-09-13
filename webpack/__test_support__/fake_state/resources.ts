import { Everything } from "../../interfaces";
import { buildResourceIndex } from "../resource_index_builder";
import {
  TaggedFarmEvent, TaggedSequence, TaggedRegimen, TaggedImage,
  TaggedTool, TaggedToolSlotPointer, TaggedUser, TaggedWebcamFeed,
  TaggedPlantPointer, TaggedGenericPointer
} from "../../resources/tagged_resources";
import { ExecutableType } from "../../farm_designer/interfaces";
import { fakeResource } from "../fake_resource";

export let resources: Everything["resources"] = buildResourceIndex();
let idCounter = 1;

export function fakeSequence(): TaggedSequence {
  return fakeResource("sequences", {
    args: { version: 4 },
    id: 12,
    color: "red",
    name: "fake",
    kind: "sequence",
    body: []
  });
}

export function fakeRegimen(): TaggedRegimen {
  return fakeResource("regimens", {
    name: "Foo",
    color: "red",
    regimen_items: []
  });
}

export function fakeFarmEvent(exe_type: ExecutableType,
  exe_id: number): TaggedFarmEvent {
  return fakeResource("farm_events", {
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
  return fakeResource("images", {
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
  return fakeResource("tools", {
    name: "Foo"
  });
}

export function fakeUser(): TaggedUser {
  return fakeResource("users", {
    id: idCounter++,
    device_id: 789,
    name: "Fake User 123",
    email: "fake@fake.com",
    created_at: "---",
    updated_at: "---"
  });
}

export function fakeToolSlot(): TaggedToolSlotPointer {
  return fakeResource("points", {
    name: "ToolSlot 1",
    pointer_type: "ToolSlot",
    tool_id: 1,
    x: 10,
    y: 10,
    z: 10,
    radius: 10,
    meta: {}
  });
}

export function fakePlant(): TaggedPlantPointer {
  return fakeResource("points", {
    name: "Strawberry Plant 1",
    pointer_type: "Plant",
    x: 100,
    y: 200,
    z: 0,
    radius: 25,
    meta: {},
    openfarm_slug: "strawberry"
  });
}

export function fakePoint(): TaggedGenericPointer {
  return fakeResource("points", {
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
  return fakeResource("webcam_feed", {
    id: idCounter++,
    created_at: "---",
    updated_at: "---",
    url: "http://i.imgur.com/iAOUmEB.jpg"
  });
}
