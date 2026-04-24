import { Actions } from "../../constants";
import { Everything } from "../../interfaces";
import { Session } from "../../session";
import { fakeState } from "../../__test_support__/fake_state";
import { defensiveClone } from "../../util";
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

  it("preserves unrelated state slices on status updates", () => {
    const state: Omit<Everything, "dispatch"> = fakeState();
    delete state["dispatch" as keyof typeof state];
    const next = rootReducer(state, {
      type: Actions.STATUS_UPDATE,
      payload: defensiveClone(state.bot.hardware),
    });
    expect(next.bot).not.toBe(state.bot);
    expect(next.resources).toBe(state.resources);
    expect(next.app).toBe(state.app);
    expect(next.config).toBe(state.config);
    expect(next.draggable).toBe(state.draggable);
  });
});
