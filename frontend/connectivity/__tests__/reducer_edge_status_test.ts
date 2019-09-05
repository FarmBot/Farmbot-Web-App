import { connectivityReducer, DEFAULT_STATE } from "../reducer";
import { networkUp, networkDown } from "../actions";

describe("connectivityReducer", () => {
  it("goes up", () => {
    const state = connectivityReducer(DEFAULT_STATE,
      networkUp("user.mqtt", undefined, "tests"));
    expect(state).toBeDefined();
    const x = state && state.uptime["user.mqtt"];
    if (x) {
      expect(x.state).toBe("up");
      expect(x.at).toBeTruthy();
    } else {
      fail();
    }
  });

  it("goes down", () => {
    const state = connectivityReducer(DEFAULT_STATE,
      networkDown("user.api", undefined, "tests"));
    const x = state && state.uptime["user.api"];
    if (x) {
      expect(x.state).toBe("down");
      expect(x.at).toBeTruthy();
    } else {
      fail();
    }
  });
});
