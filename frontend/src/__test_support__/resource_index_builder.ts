import { resourceReducer } from "../resources/reducer";
import { TaggedResource } from "../resources/tagged_resources";
import * as _ from "lodash";
import { createStore } from "redux";

let FAKE_RESOURCES: TaggedResource[] = [
  {
    "kind": "device",
    "body": {
      "id": 415,
      "name": "wispy-firefly-846",
      "webcam_url": undefined
    },
    "uuid": "device.415.0"
  },
  {
    "kind": "farm_events",
    "body": {
      "id": 21,
      "start_time": "2017-05-22T05:00:00.000Z",
      "end_time": "2017-05-30T05:00:00.000Z",
      "repeat": 1,
      "time_unit": "daily",
      "executable_id": 23,
      "executable_type": "Sequence",
      "calendar": [
        "2017-05-25T05:00:00.000Z",
        "2017-05-26T05:00:00.000Z",
        "2017-05-27T05:00:00.000Z",
        "2017-05-28T05:00:00.000Z",
        "2017-05-29T05:00:00.000Z"
      ]
    },
    "uuid": "farm_events.21.1"
  },
  {
    "kind": "farm_events",
    "body": {
      "id": 22,
      "start_time": "2017-05-22T05:00:00.000Z",
      "end_time": "2017-05-29T05:00:00.000Z",
      "repeat": 2,
      "time_unit": "daily",
      "executable_id": 24,
      "executable_type": "Sequence",
      "calendar": [
        "2017-05-26T05:00:00.000Z",
        "2017-05-28T05:00:00.000Z"
      ]
    },
    "uuid": "farm_events.22.2"
  },
  {
    "kind": "images",
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
    "uuid": "images.415.3"
  },
  {
    "kind": "images",
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
    "uuid": "images.414.4"
  },
  {
    "kind": "peripherals",
    "body": {
      "id": 11,
      "pin": 13,
      "mode": 0,
      "label": "LED"
    },
    "uuid": "peripherals.11.5"
  },
  {
    "kind": "points",
    "body": {
      "id": 1392,
      "created_at": "2017-05-24T20:41:19.804Z",
      "updated_at": "2017-05-24T20:41:19.804Z",
      "device_id": 415,
      "meta": {

      },
      "name": "fenestrate-flower-3632",
      "pointer_type": "Plant",
      "radius": 46,
      "x": 347,
      "y": 385,
      "z": 0,
      "openfarm_slug": "radish"
    },
    "uuid": "points.1392.6"
  },
  {
    "kind": "points",
    "body": {
      "id": 1393,
      "created_at": "2017-05-24T20:41:19.822Z",
      "updated_at": "2017-05-24T20:41:19.822Z",
      "device_id": 415,
      "meta": {

      },
      "name": "alate-fire-7363",
      "pointer_type": "Plant",
      "radius": 36,
      "x": 727,
      "y": 376,
      "z": 0,
      "openfarm_slug": "garlic"
    },
    "uuid": "points.1393.7"
  },
  {
    "kind": "points",
    "body": {
      "id": 1394,
      "created_at": "2017-05-24T20:41:19.855Z",
      "updated_at": "2017-05-24T20:41:19.855Z",
      "device_id": 415,
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
    "uuid": "points.1394.8"
  },
  {
    "kind": "points",
    "body": {
      "id": 1395,
      "created_at": "2017-05-24T20:41:19.889Z",
      "updated_at": "2017-05-24T20:41:19.889Z",
      "device_id": 415,
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
    "uuid": "points.1395.9"
  },
  {
    "kind": "points",
    "body": {
      "id": 1396,
      "created_at": "2017-05-24T20:41:20.112Z",
      "updated_at": "2017-05-24T20:41:20.112Z",
      "device_id": 415,
      "meta": {

      },
      "name": "Slot One.",
      "pointer_type": "ToolSlot",
      "radius": 25,
      "x": 10,
      "y": 10,
      "z": 10,
      "tool_id": 14
    },
    "uuid": "points.1396.10"
  },
  {
    "kind": "regimens",
    "body": {
      "id": 11,
      "name": "Test Regimen 456",
      "color": "gray",
      "device_id": 415,
      "regimen_items": [
        {
          "id": 33,
          "regimen_id": 11,
          "sequence_id": 23,
          "time_offset": 345900000
        }
      ]
    },
    "uuid": "regimens.11.46"
  },
  {
    "kind": "sequences",
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
            "speed": 800
          }
        }
      ],
      "args": {
        "is_outdated": false,
        "version": 4
      },
      "kind": "sequence"
    },
    "uuid": "sequences.23.47"
  },
  {
    "kind": "tools",
    "body": {
      "id": 14,
      "name": "Trench Digging Tool",
      "status": "active"
    },
    "uuid": "tools.14.49"
  }
];

export
  function buildResourceIndex(resources: TaggedResource[] = FAKE_RESOURCES) {
  const KIND: keyof TaggedResource = "kind"; // Safety first, kids.
  let store = createStore(resourceReducer);
  _(resources)
    .groupBy(KIND)
    .pairs()
    .map((x: [(TaggedResource["kind"]), TaggedResource[]]) => x)
    .map(y => ({ type: "RESOURCE_READY", payload: { name: y[0], data: y[1] } }))
    .map(store.dispatch);
  return store.getState();
}
