import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { TaggedResource } from "farmbot";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { newTaggedResource } from "../../sync/actions";
import { selectAllRegimens } from "../../resources/selectors";
import { fakeVariableNameSet } from "../../__test_support__/fake_variables";
import {
  fakeRegimen, fakeSequence,
} from "../../__test_support__/fake_state/resources";

describe("mapStateToProps()", () => {
  it("returns props: no regimen selected", () => {
    const props = mapStateToProps(fakeState());
    expect(props.current).toEqual(undefined);
    expect(props.calendar).toEqual([]);
  });

  it("returns props: active regimen", () => {
    const state = fakeState();
    const fakeResources: TaggedResource[] = [
      ...newTaggedResource("Regimen", {
        id: 10000,
        name: "Test Regimen",
        color: "gray",
        regimen_items: [
          { id: 1, regimen_id: 10000, sequence_id: 20000, time_offset: 1000 },
        ]
      }),
      ...newTaggedResource("Sequence", {
        id: 20000,
        name: "Test Sequence",
        color: "gray",
        body: [{ kind: "wait", args: { milliseconds: 100 } }],
        args: {
          "version": 4, "locals": { "kind": "scope_declaration", "args": {} },
        },
        kind: "sequence"
      }),
    ];
    const { index } = buildResourceIndex(fakeResources);
    state.resources.index = index;
    const { uuid } = selectAllRegimens(index)[0];
    state.resources.consumers.regimens.currentRegimen = uuid;
    const props = mapStateToProps(state);
    props.current ? expect(props.current.uuid).toEqual(uuid) : fail;
    expect(props.calendar[0].items[0].item.time_offset).toEqual(1000);
  });

  it("returns variableData", () => {
    const reg = fakeRegimen();
    const seq = fakeSequence();
    reg.body.regimen_items = [{
      sequence_id: seq.body.id || 0, time_offset: 1000
    }];
    const state = fakeState();
    state.resources = buildResourceIndex([reg, seq]);
    state.resources.consumers.regimens.currentRegimen = reg.uuid;
    const varData = fakeVariableNameSet();
    state.resources.index.sequenceMetas[seq.uuid] = varData;
    const props = mapStateToProps(state);
    expect(props.variableData).toEqual(varData);
  });

  it("returns calendar rows", () => {
    const reg = fakeRegimen();
    const seq = fakeSequence();
    seq.body.body = [{
      kind: "move_absolute", args: {
        location: { kind: "identifier", args: { label: "variable" } },
        offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
        speed: 100,
      }
    }];
    seq.body.args.locals.body = [{
      kind: "parameter_declaration",
      args: {
        label: "variable",
        default_value: { kind: "coordinate", args: { x: 1, y: 2, z: 3 } }
      }
    }];
    reg.body.regimen_items = [{
      sequence_id: seq.body.id || 0, time_offset: 1000
    }];
    const state = fakeState();
    state.resources = buildResourceIndex([reg, seq]);
    state.resources.consumers.regimens.currentRegimen = reg.uuid;
    const props = mapStateToProps(state);
    expect(props.calendar).toEqual([{
      day: "1",
      items: [expect.objectContaining({
        item: reg.body.regimen_items[0],
        sortKey: 1000, variable: "variable"
      })]
    }]);
  });
});
