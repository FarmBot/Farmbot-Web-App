jest.disableAutomock();

import { fakeState } from "../../../__test_support__/fake_state";
import { mapResourcesToCalendar } from "../map_state_to_props";
import { ResourceIndex } from "../../../resources/interfaces";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { TaggedResource } from "../../../resources/tagged_resources";

describe("mapResourcesToCalendar()", () => {
  it("returns a `Calendar` instance when given a resource index and unix time.",
    () => {
      const FOUR_THIRTY = 1500481800; // 19 JULY 17 16:30
      let wow = fakeResources();
      let ri = buildResourceIndex(wow);
      let results = mapResourcesToCalendar(ri.index, FOUR_THIRTY).getAll();
      expect(true).toBeFalsy();
    });
});

function fakeResources(): TaggedResource[] {
  return [
    {
      "kind": "regimens",
      "body": {
        "id": 78,
        "name": "test regimen 1",
        "color": "blue",
        "device_id": 149,
        "regimen_items": [
          {
            "id": 5354,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 0
          },
          {
            "id": 5355,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 3600000
          },
          {
            "id": 5356,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 7200000
          },
          {
            "id": 5357,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 10800000
          },
          {
            "id": 5358,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 14400000
          },
          {
            "id": 5359,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 18000000
          },
          {
            "id": 5360,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 21600000
          },
          {
            "id": 5361,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 25200000
          },
          {
            "id": 5362,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 28800000
          },
          {
            "id": 5363,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 32400000
          },
          {
            "id": 5364,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 36000000
          },
          {
            "id": 5365,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 39600000
          },
          {
            "id": 5366,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 43200000
          },
          {
            "id": 5367,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 46800000
          },
          {
            "id": 5368,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 50400000
          },
          {
            "id": 5369,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 54000000
          },
          {
            "id": 5370,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 57600000
          },
          {
            "id": 5371,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 61200000
          },
          {
            "id": 5372,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 64800000
          },
          {
            "id": 5373,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 68400000
          },
          {
            "id": 5374,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 72000000
          },
          {
            "id": 5375,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 75600000
          },
          {
            "id": 5376,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 79200000
          },
          {
            "id": 5377,
            "regimen_id": 78,
            "sequence_id": 589,
            "time_offset": 82800000
          }
        ]
      },
      "uuid": "regimens.78.395"
    },
    {
      "kind": "sequences",
      "body": {
        "id": 589,
        "name": "Do nothing",
        "color": "gray",
        "body": [

        ],
        "args": {
          "is_outdated": false,
          "version": 4
        },
        "kind": "sequence"
      },
      "uuid": "sequences.589.416"
    },
    {
      "kind": "farm_events",
      "body": {
        "id": 217,
        "start_time": "2017-07-21T00:30:00.000Z",
        "end_time": "2017-07-21T00:31:00.000Z",
        "repeat": 1,
        "time_unit": "never",
        "executable_id": 78,
        "executable_type": "Regimen",
        "calendar": [
          "2017-07-21T00:30:00.000Z"
        ]
      },
      "uuid": "farm_events.0.435"
    }
  ];
}
