import { Actions } from "../../constants";
import { generateReducer } from "../generate_reducer";

describe("generateReducer", () => {
  it("returns the same state reference for unrelated actions", () => {
    const reducer = generateReducer({ count: 1, nested: { value: 2 } });
    const state = { count: 1, nested: { value: 2 } };
    const result = reducer(state, {
      type: "NO_HANDLER" as Actions,
      payload: undefined,
    });
    expect(result).toBe(state);
  });

  it("clones state for handled actions", () => {
    const reducer = generateReducer({ count: 1 })
      .add<number>(Actions.CHANGE_STEP_SIZE, (state, action) => {
        state.count = action.payload;
        return state;
      });
    const state = { count: 1 };
    const result = reducer(state, {
      type: Actions.CHANGE_STEP_SIZE,
      payload: 2,
    });
    expect(result).not.toBe(state);
    expect(result.count).toEqual(2);
    expect(state.count).toEqual(1);
  });
});
