jest.mock("../../session", () => ({ Session: { clear: jest.fn() } }));

import { Actions } from "../../constants";
import { Everything } from "../../interfaces";
import { Session } from "../../session";
import { fakeState } from "../../__test_support__/fake_state";
import { rootReducer } from "../root_reducer";

describe("rootReducer()", () => {
  it("logs out", () => {
    const state: Omit<Everything, "dispatch"> = fakeState();
    delete state["dispatch" as keyof typeof state];
    const reducers = state;
    rootReducer(reducers, { type: Actions.LOGOUT, payload: {} });
    expect(Session.clear).toHaveBeenCalled();
  });
});
