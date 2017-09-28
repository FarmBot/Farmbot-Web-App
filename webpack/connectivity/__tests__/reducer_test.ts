import { connectivityReducer } from "../reducer";
import { networkUp, networkDown } from "../actions";

describe("connectivityReducer", () => {
  it("goes up", () => {
    const state = connectivityReducer(undefined, networkUp());
    expect(state).toBeDefined();
    expect(state && state.state).toBe("up");
    expect(state && state.at).toBeTruthy();
  });

  it("goes down", () => {
    const state = connectivityReducer(undefined, networkDown());
    expect(state).toBeDefined();
    expect(state && state.state).toBe("down");
    expect(state && state.at).toBeTruthy();
  });
});
