import { sequenceReducer } from "../reducer";
import { Actions } from "../../constants";
import { fakeSequence } from "../../__test_support__/fake_state/resources";

describe("sequence reducer", () => {
  function resourcePayload(
    before: string | undefined,
    actionType: Actions,
    after: string | undefined) {
    const sequence = fakeSequence();
    sequence.uuid = "sequence";
    const state = { current: before };
    const action = { type: actionType, payload: sequence };
    const stateAfter = sequenceReducer(state, action);
    expect(stateAfter.current).toBe(after);
  }

  it("sets current sequence with sequence", () => {
    resourcePayload(undefined, Actions.INIT_RESOURCE, "sequence");
  });

  it("unsets current sequence with sequence", () => {
    resourcePayload("sequence", Actions.DESTROY_RESOURCE_OK, undefined);
  });

  it("sets current sequence with string", () => {
    const state = { current: undefined };
    const action = { type: Actions.SELECT_SEQUENCE, payload: "sequence" };
    const stateAfter = sequenceReducer(state, action);
    expect(stateAfter.current).toBe("sequence");
  });
});
