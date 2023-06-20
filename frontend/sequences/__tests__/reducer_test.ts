import { sequenceReducer } from "../reducer";
import { Actions } from "../../constants";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { emptyState } from "../../resources/reducer";

describe("sequence reducer", () => {
  function resourcePayload(
    before: string | undefined,
    actionType: Actions,
    after: string | undefined) {
    const sequence = fakeSequence();
    sequence.uuid = "sequence";
    const state = emptyState().consumers.sequences;
    state.current = before;
    const action = { type: actionType, payload: sequence };
    const stateAfter = sequenceReducer(state, action);
    expect(stateAfter.current).toBe(after);
  }

  it("unsets current sequence with sequence", () => {
    resourcePayload("sequence", Actions.DESTROY_RESOURCE_OK, undefined);
  });

  it("sets current sequence with string", () => {
    const state = emptyState().consumers.sequences;
    const action = { type: Actions.SELECT_SEQUENCE, payload: "sequence" };
    const stateAfter = sequenceReducer(state, action);
    expect(stateAfter.current).toBe("sequence");
  });

  it("sets step position", () => {
    const state = emptyState().consumers.sequences;
    const action = { type: Actions.SET_SEQUENCE_STEP_POSITION, payload: 1 };
    const stateAfter = sequenceReducer(state, action);
    expect(stateAfter.stepIndex).toBe(1);
  });
});
