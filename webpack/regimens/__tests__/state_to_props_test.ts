import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { TaggedResource, SpecialStatus } from "farmbot";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";

describe("mapStateToProps()", () => {
  it("returns props: no regimen selected", () => {
    const props = mapStateToProps(fakeState());
    expect(props.current).toEqual(undefined);
    expect(props.calendar).toEqual([]);
  });

  it("returns props: active regimen", () => {
    const state = fakeState();
    const fakeResources: TaggedResource[] = [
      {
        "specialStatus": SpecialStatus.SAVED,
        "kind": "Regimen",
        "body": {
          "id": 1,
          "name": "Test Regimen",
          "color": "gray",
          "regimen_items": [
            {
              "id": 1,
              "regimen_id": 1,
              "sequence_id": 1,
              "time_offset": 1000
            }
          ]
        },
        "uuid": "N/A"
      },
      {
        "kind": "Sequence",
        "specialStatus": SpecialStatus.SAVED,
        "body": {
          "id": 1,
          "name": "Test Sequence",
          "color": "gray",
          "body": [{ kind: "wait", args: { milliseconds: 100 } }],
          "args": {
            "version": 4,
            "locals": { "kind": "scope_declaration", "args": {} },
          },
          "kind": "sequence"
        },
        "uuid": "N/A"
      }
    ];
    state.resources.index = buildResourceIndex(fakeResources).index;
    const regimenUuid = state.resources.index.all[0];
    state.resources.consumers.regimens.currentRegimen = regimenUuid;
    const props = mapStateToProps(state);
    props.current ? expect(props.current.uuid).toEqual(regimenUuid) : fail;
    expect(props.calendar[0].items[0].item.time_offset).toEqual(1000);
  });
});
