import { resourceReducer } from "../reducer";
import { fakeState } from "../../__test_support__/fake_state";
import { overwrite, refreshStart, refreshOK, refreshNO } from "../../api/crud";
import { SpecialStatus, TaggedSequence, TaggedDevice } from "../tagged_resources";

describe("resource reducer", () => {
  it("marks resources as DIRTY when reducing OVERWRITE_RESOURCE", () => {
    const state = fakeState().resources;
    const uuid = state.index.byKind.sequences[0];
    const sequence = state.index.references[uuid] as TaggedSequence;
    expect(sequence).toBeTruthy();

    expect(sequence.kind).toBe("sequences");
    const next = resourceReducer(state, overwrite(sequence, {
      name: "wow",
      body: []
    }));
    const seq2 = next.index.references[uuid] as TaggedSequence;
    expect(seq2.specialStatus).toBe(SpecialStatus.DIRTY);
  });

  it("marks resources as SAVING when reducing REFRESH_RESOURCE_START", () => {
    const state = fakeState().resources;
    const uuid = state.index.byKind.device[0];
    const device = state.index.references[uuid] as TaggedSequence;
    expect(device).toBeTruthy();

    expect(device.kind).toBe("device");
    const afterStart = resourceReducer(state, refreshStart(device.uuid));
    const dev2 = afterStart.index.references[uuid] as TaggedDevice;
    expect(dev2.specialStatus).toBe(SpecialStatus.SAVING);

    // SCENARIO: REFRESH_START ===> REFRESH_OK
    const afterOk = resourceReducer(afterStart, refreshOK(device));
    const dev3 = afterOk.index.references[uuid] as TaggedDevice;
    expect(dev3.specialStatus).toBe(undefined);

    // SCENARIO: REFRESH_START ===> REFRESH_NO
    const afterNo =
      resourceReducer(afterStart, refreshNO({ err: "X", uuid: dev3.uuid }));
    const dev4 = afterNo.index.references[uuid] as TaggedDevice;
    expect(dev4.specialStatus).toBe(undefined);
  });
});
