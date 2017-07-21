import { fakeState } from "../../../__test_support__/fake_state";
import { mapResourcesToCalendar } from "../map_state_to_props";
import { ResourceIndex } from "../../../resources/interfaces";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { TaggedResource } from "../../../resources/tagged_resources";
import * as moment from "moment";

describe("mapResourcesToCalendar()", () => {
  it("returns a `Calendar` instance when given a resource index and unix time.",
    () => {
      pending();
      // 19 JULY 17 16:30
      const TWO_O_EIGHT = 1500664092110;
      let wow = fakeResources();
      let ri = buildResourceIndex(wow);
      let results = mapResourcesToCalendar(ri.index, TWO_O_EIGHT).getAll();
      expect(results.length).toBe(1);
      let item1 = results[0];
      expect(item1.month).toBe("Jul");
      expect(item1.day).toBe(17);
    });
});

function fakeResources(): TaggedResource[] {
  return [
    {
      "kind": "farm_events",
      "body": {
        "id": 76,
        "start_time": "2017-07-19T21:20:00.000",
        "end_time": "2017-07-21T20:57:00.000",
        "repeat": 1,
        "time_unit": "daily",
        "executable_id": 25,
        "executable_type": "Regimen",
        "calendar": [

        ]
      },
      "uuid": "farm_events.76.2"
    },
    {
      "kind": "regimens",
      "body": {
        "id": 25,
        "name": "Every 4 hours",
        "color": "gray",
        "device_id": 49,
        "regimen_items": [
          {
            "id": 86,
            "regimen_id": 25,
            "sequence_id": 52,
            "time_offset": 300000
          },
          {
            "id": 87,
            "regimen_id": 25,
            "sequence_id": 52,
            "time_offset": 14700000
          },
          {
            "id": 88,
            "regimen_id": 25,
            "sequence_id": 52,
            "time_offset": 29100000
          },
          {
            "id": 89,
            "regimen_id": 25,
            "sequence_id": 52,
            "time_offset": 43500000
          },
          {
            "id": 90,
            "regimen_id": 25,
            "sequence_id": 52,
            "time_offset": 57900000
          },
          {
            "id": 91,
            "regimen_id": 25,
            "sequence_id": 52,
            "time_offset": 50400000
          },
          {
            "id": 92,
            "regimen_id": 25,
            "sequence_id": 52,
            "time_offset": 72000000
          }
        ]
      },
      "uuid": "regimens.25.49"
    },
    {
      "kind": "sequences",
      "body": {
        "id": 52,
        "name": "Goto 0, 0, 0 123",
        "color": "gray",
        "body": [],
        "args": {
          "is_outdated": false,
          "version": 4
        },
        "kind": "sequence"
      },
      "uuid": "sequences.52.52"
    }
  ];
}
