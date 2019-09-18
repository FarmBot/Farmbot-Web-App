import { connectivityReducer, DEFAULT_STATE } from "../reducer";
import { networkUp, networkDown } from "../actions";

describe("connectivityReducer", () => {
  it("ignores `bot.mqtt` because that is handled by PING_OK/PING_NO", () => {
    const state = connectivityReducer(DEFAULT_STATE, networkUp("bot.mqtt"));
    expect(state).toEqual(DEFAULT_STATE);
  });

  it("goes up", () => {
    const state = connectivityReducer(DEFAULT_STATE,
      networkUp("user.mqtt"));
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
      networkDown("user.api"));
    const x = state && state.uptime["user.api"];
    if (x) {
      expect(x.state).toBe("down");
      expect(x.at).toBeTruthy();
    } else {
      fail();
    }
  });
});
