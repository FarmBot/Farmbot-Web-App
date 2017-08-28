import { resourceReducer } from "../reducer";
import { fakeState } from "../../__test_support__/fake_state";
import { overwrite } from "../../api/crud";
import { SpecialStatus, TaggedSequence } from "../tagged_resources";

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
});
