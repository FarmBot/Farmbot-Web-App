import { connectivityReducer, DEFAULT_STATE } from "../reducer";
import { Actions } from "../../constants";
import { networkUp, networkDown } from "../actions";

describe("connectivity reducer", () => {
  const newState = () => {
    const action = { type: Actions.START_QOS_PING, payload: { id: "yep" } };
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
    const state = connectivityReducer(newState(), networkUp("bot.mqtt", 1234, "yep"));
    const { yep } = state.pings;
    expect(yep).toBeTruthy();
    if (yep) {
      expect(yep.kind).toEqual("complete");
    }
  });

  it("handles a `down` QoS ping", () => {
    const state = connectivityReducer(newState(), networkDown("bot.mqtt", 1234, "yep"));
    const { yep } = state.pings;
    expect(yep).toBeTruthy();
    if (yep) {
      expect(yep.kind).toEqual("timeout");
    }
  });
});
