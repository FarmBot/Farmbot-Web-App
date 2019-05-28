import {
  SpecialStatus,
  TaggedDevice,
  TaggedLog,
  TaggedPoint,
  TaggedResource,
  TaggedSequence,
  TaggedRegimen,
} from "farmbot";
import { resourceReducer, emptyState } from "../resources/reducer";
import { resourceReady } from "../sync/actions";
import { threeWayComparison as c3 } from "../util/move";
import { defensiveClone } from "../util/util";
import { chain, groupBy } from "lodash";
import { MessageType } from "../sequences/interfaces";

const DEFAULT_DEVICE_BODY: TaggedDevice["body"] = {
  "id": 415,
  "name": "wispy-firefly-846",
  "tz_offset_hrs": 0
};

export function fakeDevice(body: Partial<TaggedDevice["body"]> = {}):
  TaggedDevice {

  return {
    "kind": "Device",
    "specialStatus": SpecialStatus.SAVED,
    "body": { ...DEFAULT_DEVICE_BODY, ...body },
    "uuid": "Device.415.0"
  };
}

const tr0: TaggedResource = {
  "kind": "Sequence",
  "specialStatus": SpecialStatus.SAVED,
  "body": {
    "id": 23,
    "name": "Goto 0, 0, 0",
    "color": "gray",
    "body": [
      {
        "kind": "move_absolute",
        "args": {
          "location": {
            "kind": "coordinate",
            "args": {
              "x": 0,
              "y": 0,
              "z": 0
            }
          },
          "offset": {
            "kind": "coordinate",
            "args": {
              "x": 0,
              "y": 0,
              "z": 0
            }
          },
          "speed": 100
        }
      }
    ],
    "args": {
      "version": 4,
      "locals": { kind: "scope_declaration", args: {} },
    },
    "kind": "sequence"
  },
  "uuid": "Sequence.23.47"
};

const tr1: TaggedResource = {
  "kind": "User",
  "body": {
    "id": 152,
    "name": "FarmBot 1",
    "email": "farmbot1@farmbot.io",
    "created_at": "2017-09-03T20:01:40.336Z",
    "updated_at": "2017-09-27T14:00:47.326Z",
  },
  "specialStatus": SpecialStatus.SAVED,
  "uuid": "User.152.44"
};

const tr2: TaggedResource = {
  "specialStatus": SpecialStatus.SAVED,
  "kind": "FarmEvent",
  "body": {
    "id": 21,
    "start_time": "2017-05-22T05:00:00.000Z",
    "end_time": "2017-05-30T05:00:00.000Z",
    "repeat": 1,
    "time_unit": "daily",
    "executable_id": tr0.body.id || 0,
    "executable_type": "Sequence"
  },
  "uuid": "FarmEvent.21.1"
};

const tr3: TaggedResource = {
  "specialStatus": SpecialStatus.SAVED,
  "kind": "FarmEvent",
  "body": {
    "id": 22,
    "start_time": "2017-05-22T05:00:00.000Z",
    "end_time": "2017-05-29T05:00:00.000Z",
    "repeat": 2,
    "time_unit": "daily",
    "executable_id": tr0.body.id || 0,
    "executable_type": "Sequence"
  },
  "uuid": "FarmEvent.22.2"
};

const tr4: TaggedResource = {
  "specialStatus": SpecialStatus.SAVED,
  "kind": "Image",
  "body": {
    "id": 415,
    "device_id": 415,
    "attachment_processed_at": undefined,
    "updated_at": "2017-05-24T20:41:19.766Z",
    "created_at": "2017-05-24T20:41:19.766Z",
    "attachment_url": "https://placehold.it/640%3Ftext=Processing...",
    "meta": {
      "x": 928,
      "y": 428,
      "z": 144
    }
  },
  "uuid": "Image.415.3"
};

const tr5: TaggedResource = {
  "specialStatus": SpecialStatus.SAVED,
  "kind": "Image",
  "body": {
    "id": 414,
    "device_id": 415,
    "attachment_processed_at": undefined,
    "updated_at": "2017-05-24T20:41:19.691Z",
    "created_at": "2017-05-24T20:41:19.691Z",
    "attachment_url": "http://placehold.it/640%3Ftext=Processing...",
    "meta": {
      "x": 853,
      "y": 429,
      "z": 165
    }
  },
  "uuid": "Image.414.4"
};

const tr6: TaggedResource = {
  "specialStatus": SpecialStatus.SAVED,
  "kind": "Peripheral",
  "body": {
    "id": 11,
    "pin": 13,
    "label": "LED"
  },
  "uuid": "Peripheral.11.5"
};

const tr7: TaggedPoint = {
  "specialStatus": SpecialStatus.SAVED,
  "kind": "Point",
  "body": {
    "id": 1392,
    "created_at": "2017-05-24T20:41:19.804Z",
    "updated_at": "2017-05-24T20:41:19.804Z",
    "meta": {

    },
    "name": "fenestrate-flower-3632",
    "pointer_type": "Plant",
    "radius": 46,
    "x": 347,
    "y": 385,
    "z": 0,
    "openfarm_slug": "radish",
    "plant_stage": "planned"
  },
  "uuid": "Point.1392.6"
};

const tr8: TaggedPoint = {
  "specialStatus": SpecialStatus.SAVED,
  "kind": "Point",
  "body": {
    "id": 1393,
    "created_at": "2017-05-24T20:41:19.822Z",
    "updated_at": "2017-05-24T20:41:19.822Z",
    "meta": {

    },
    "name": "alate-fire-7363",
    "pointer_type": "Plant",
    "radius": 36,
    "x": 727,
    "y": 376,
    "z": 0,
    "openfarm_slug": "garlic",
    "plant_stage": "planned"
  },
  "uuid": "Point.1393.7"
};

const tr9: TaggedPoint = {
  "specialStatus": SpecialStatus.SAVED,
  "kind": "Point",
  "body": {
    "id": 1394,
    "created_at": "2017-05-24T20:41:19.855Z",
    "updated_at": "2017-05-24T20:41:19.855Z",
    "meta": {
      "color": undefined,
      "created_by": "plant-detection"
    },
    "name": "untitled",
    "pointer_type": "GenericPointer",
    "radius": 6,
    "x": 1245,
    "y": 637,
    "z": 5
  },
  "uuid": "Point.1394.8"
};

const tr10: TaggedPoint = {
  "specialStatus": SpecialStatus.SAVED,
  "kind": "Point",
  "body": {
    "id": 1395,
    "created_at": "2017-05-24T20:41:19.889Z",
    "updated_at": "2017-05-24T20:41:19.889Z",
    "meta": {
      "color": "gray",
      "created_by": "plant-detection"
    },
    "name": "untitled",
    "pointer_type": "GenericPointer",
    "radius": 10,
    "x": 490,
    "y": 421,
    "z": 5
  },
  "uuid": "Point.1395.9"
};

const tr11: TaggedPoint = {
  "kind": "Point",
  "specialStatus": SpecialStatus.SAVED,
  "body": {
    "id": 1396,
    "created_at": "2017-05-24T20:41:20.112Z",
    "updated_at": "2017-05-24T20:41:20.112Z",
    "meta": {

    },
    "name": "Slot One.",
    "pointer_type": "ToolSlot",
    "pullout_direction": 0,
    "gantry_mounted": false,
    "radius": 25,
    "x": 10,
    "y": 10,
    "z": 10,
    "tool_id": 14
  },
  "uuid": "Point.1396.10"
};

const tr12: TaggedResource = {
  "specialStatus": SpecialStatus.SAVED,
  "kind": "Regimen",
  "body": {
    "id": 11,
    "name": "Test Regimen 456",
    "color": "gray",
    "regimen_items": [
      {
        "id": 33,
        "regimen_id": 11,
        "sequence_id": 23,
        "time_offset": 345900000
      }
    ],
    body: [],
  },
  "uuid": "Regimen.11.46"
};

const tr14: TaggedResource = {
  "specialStatus": SpecialStatus.SAVED,
  "kind": "Tool",
  "body": {
    "id": 14,
    "name": "Trench Digging Tool",
    "status": "active"
  },
  "uuid": "Tool.14.49"
};

const tr15: TaggedResource = {
  "specialStatus": SpecialStatus.SAVED,
  "kind": "Tool",
  "body": {
    "id": 15,
    "name": "Berry Picking Tool",
    "status": "inactive"
  },
  "uuid": "Tool.15.50"
};

const log: TaggedLog = {
  kind: "Log",
  specialStatus: SpecialStatus.SAVED,
  body: {
    id: 1091396, created_at: 1510010193,
    message: "Farmbot Movement complete.",
    type: MessageType.success,
    channels: []
  },
  uuid: "Log.1091396.70"
};

export let FAKE_RESOURCES: TaggedResource[] = [
  tr1,
  fakeDevice(),
  tr2,
  tr3,
  tr4,
  tr5,
  tr6,
  tr7,
  tr8,
  tr9,
  tr10,
  tr11,
  tr12,
  tr0,
  tr14,
  tr15,
  log
];
const KIND: keyof TaggedResource = "kind"; // Safety first, kids.
type ResourceGroupNumber = 0 | 1 | 2 | 3 | 4;
type ResourceLookupTable = Record<TaggedResource["kind"], ResourceGroupNumber>;

/** In the real app, resources are loaded in a particular order.
 * This table serves as a reference to prevent referential integrity issues. */
const KIND_PRIORITY: ResourceLookupTable = {
  User: 0,
  Device: 0,
  FbosConfig: 0,
  FirmwareConfig: 0,
  FarmwareEnv: 0,
  FarmwareInstallation: 0,
  WebAppConfig: 0,
  SavedGarden: 0,
  PlantTemplate: 1,
  Peripheral: 1,
  Point: 1,
  Sensor: 1,
  Tool: 1,
  Alert: 1,
  SensorReading: 2,
  Sequence: 2,
  Regimen: 3,
  PinBinding: 3,
  FarmEvent: 4,
  DiagnosticDump: 4,
  Image: 4,
  Log: 4,
  WebcamFeed: 4,
  Crop: 4,
};
export function buildResourceIndex(resources: TaggedResource[] = FAKE_RESOURCES,
  state = emptyState()) {
  const sortedResources = repairBrokeReferences(resources)
    .sort((l, r) => c3(KIND_PRIORITY[l.kind], KIND_PRIORITY[r.kind]));
  type K = keyof typeof KIND_PRIORITY;
  return chain(sortedResources)
    .groupBy(KIND)
    .toPairs()
    .sort((l, r) => c3(KIND_PRIORITY[l[0] as K || 4], KIND_PRIORITY[r[0] as K || 4]))
    .map((x: [TaggedResource["kind"], TaggedResource[]]) => x)
    .map((y) => resourceReady(y[0], y[1]))
    .reduce(resourceReducer, state)
    .value();
}

const blankSeq: TaggedSequence = {
  "kind": "Sequence",
  "specialStatus": SpecialStatus.SAVED,
  "body": {
    "id": undefined,
    "name": "Repair sequence",
    "color": "gray",
    "body": [],
    "args": {
      "version": 4,
      "locals": { kind: "scope_declaration", args: {} },
    },
    "kind": "sequence"
  },
  "uuid": "Sequence.23.47"
};

const blankReg: TaggedRegimen = {
  "specialStatus": SpecialStatus.SAVED,
  "kind": "Regimen",
  "body": {
    "id": 11,
    "name": "Repair Sequence",
    "color": "gray",
    "regimen_items": [],
    body: [],
  },
  "uuid": "Regimen.11.46"
};

/** HISTORIC CONTEXT: At one point, the API kept track of `inUse` stats.
 * This meant that we could do funny things in the test suite like set
 * `executable_id` to nonsense values like 0 or -1. This led to an enormous
 * number of failed tests. To circumvent this, we "repair" faulty foreign keys
 * in TaggedResources. This applies to many legacy tests. - RC*/
function repairBrokeReferences(resources: TaggedResource[]): TaggedResource[] {
  const table = groupBy(resources, x => x.kind);
  resources.map(resource => {
    if (resource.kind === "FarmEvent") { // Find FarmEvents
      const { executable_type, executable_id } = resource.body;
      const missingResource = // Ensure foreign key is valid.
        !(table[executable_type] || []).find(r => r.body.id === executable_id);
      if (missingResource) { // If not found, add a dummy resource to the list.
        const base =
          defensiveClone(executable_type == "Regimen" ? blankReg : blankSeq);
        base.body.id = executable_id;
        resources.push(base);
      }
    }
  });
  return resources;
}
