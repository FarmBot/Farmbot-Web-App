import { connectivityReducer, DEFAULT_STATE } from "../reducer";
import { networkUp, networkDown } from "../actions";

describe("connectivityReducer", () => {
  it("updates `bot.mqtt`", () => {
    const state = connectivityReducer(DEFAULT_STATE, networkUp("bot.mqtt"));
    expect(state.uptime["bot.mqtt"]?.state).toBe("up");
  });

  it("goes up", () => {
    const state = connectivityReducer(DEFAULT_STATE,
      networkUp("user.mqtt"));
    expect(state).toBeDefined();
    const x = state && state.uptime["user.mqtt"];
    expect(x?.state).toBe("up");
    expect(x?.at).toBeTruthy();
  });

  it("goes down", () => {
    const state = connectivityReducer(DEFAULT_STATE,
      networkDown("user.api"));
    const x = state && state.uptime["user.api"];
    expect(x?.state).toBe("down");
    expect(x?.at).toBeTruthy();
  });
});
