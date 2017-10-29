import { Everything } from "../../interfaces";
import { buildResourceIndex } from "../resource_index_builder";
import {
  TaggedFarmEvent, TaggedSequence, TaggedRegimen, TaggedImage,
  TaggedTool, TaggedToolSlotPointer, TaggedUser, TaggedWebcamFeed,
  TaggedPlantPointer, TaggedGenericPointer, TaggedPeripheral
} from "../../resources/tagged_resources";
import { ExecutableType } from "../../farm_designer/interfaces";
import { fakeResource } from "../fake_resource";

export let resources: Everything["resources"] = buildResourceIndex();
let idCounter = 1;

export function fakeSequence(): TaggedSequence {
  return fakeResource("Sequence", {
    args: { version: 4 },
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
    meta: {}
  });
}

export function fakePlant(): TaggedPlantPointer {
  return fakeResource("Point", {
    id: idCounter++,
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

export function fakePeripheral(): TaggedPeripheral {
  return fakeResource("Peripheral", {
    id: idCounter++,
    label: "Fake Pin",
    pin: 1
  });
}
