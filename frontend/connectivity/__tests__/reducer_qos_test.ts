jest.mock("../../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({ NO: "NO" })),
  }
}));

import { connectivityReducer, DEFAULT_STATE } from "../reducer";
import { Actions } from "../../constants";
import { pingOK, pingNO } from "..";
import { store } from "../../redux/store";
import { cloneDeep } from "lodash";

describe("connectivity reducer", () => {
  const newState = () => {
    const action = { type: Actions.PING_START, payload: { id: "yep" } };
    return connectivityReducer(DEFAULT_STATE, action);
  };

  it("starts a ping", () => {
    const ping = newState().pings["yep"];
    expect(ping?.kind).toBe("pending");
  });

  it("handles the PING_OK action", () => {
    const action = { type: Actions.PING_OK, payload: { id: "yep", at: 123 } };
    const state = connectivityReducer(newState(), action);
    const { yep } = state.pings;
    expect(yep).toBeTruthy();
    if (yep) {
      expect(yep.kind).toEqual("complete");
    }
  });

  it("broadcasts PING_OK", () => {
    pingOK("yep", 123);
    expect(store.dispatch).toHaveBeenCalledWith({
      payload: { at: 123, id: "yep" },
      type: "PING_OK",
    });
  });

  it("broadcasts PING_NO", () => {
    pingNO("yep", 123);
    expect(store.dispatch).toHaveBeenCalledWith({
      payload: { id: "yep", at: 123 },
      type: "PING_NO"
    });
  });

  it("marks pings as failed when PING_NO is dispatched", () => {
    const action = { type: Actions.PING_NO, payload: { id: "yep", at: 123 } };
    const state = connectivityReducer(newState(), action);
    const { yep } = state.pings;
    expect(yep).toBeTruthy();
    if (yep) {
      expect(yep.kind).toEqual("timeout");
    }
  });

  it("doesn't bring network state down with old pings", () => {
    const oldState = cloneDeep(DEFAULT_STATE);
    oldState.pings = {
      "a": { kind: "pending", start: 50 },
      "b": { kind: "complete", start: 100, end: 200 },
    };
    const action = { type: Actions.PING_NO, payload: { id: "a" } };
    const state = connectivityReducer(oldState, action);
    expect(state.uptime["bot.mqtt"]).toEqual(undefined);
  });
});
