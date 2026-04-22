import { Actions } from "../../constants";
import { Everything } from "../../interfaces";
import { Session } from "../../session";
import { fakeState } from "../../__test_support__/fake_state";
import { rootReducer } from "../root_reducer";

describe("rootReducer()", () => {
  let clearSpy: jest.SpyInstance;

  beforeEach(() => {
    clearSpy = jest.spyOn(Session, "clear")
      .mockImplementation((() => undefined) as typeof Session.clear);
  });

  afterEach(() => {
    clearSpy.mockRestore();
  });

  it("logs out", () => {
    const state: Omit<Everything, "dispatch"> = fakeState();
    delete state["dispatch" as keyof typeof state];
    const reducers = state;
    rootReducer(reducers, { type: Actions.LOGOUT, payload: {} });
    expect(Session.clear).toHaveBeenCalled();
  });
});
