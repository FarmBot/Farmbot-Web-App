import { connectivityReducer, DEFAULT_STATE } from "../reducer";
import { Actions } from "../../constants";

describe("connectivity reducer", () => {
  const newState = () => {
    const action = { type: Actions.PING_START, payload: { id: "yep" } };
    return connectivityReducer(DEFAULT_STATE, action);
  };

  it("starts a ping", () => {
    const ping = newState().pings["yep"];
    if (ping) {
      expect(ping.kind).toBe("pending");
    } else {
      fail();
    }

  });

  it("handles an `up` QoS ping", () => {
    const action = { type: Actions.PING_OK, payload: { id: "yep", at: 123 } };
    const state = connectivityReducer(newState(), action);
    const { yep } = state.pings;
    expect(yep).toBeTruthy();
    if (yep) {
      expect(yep.kind).toEqual("complete");
    }
  });

  it("handles a `down` QoS ping", () => {
    const action = { type: Actions.PING_OK, payload: { id: "yep" } };
    const state = connectivityReducer(newState(), action);
    const { yep } = state.pings;
    expect(yep).toBeTruthy();
    if (yep) {
      expect(yep.kind).toEqual("complete");
    }
  });
});
