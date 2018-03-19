import { fakeState } from "../../__test_support__/fake_state";
import { versionChangeMiddleware } from "../version_tracker_middleware";
import { buildResourceIndex, fakeDevice } from "../../__test_support__/resource_index_builder";
import { MiddlewareAPI } from "redux";
import { Everything } from "../../interfaces";

describe("version tracker middleware", () => {
  it("Calls Rollbar.configure", () => {
    const before = window.Rollbar;
    window.Rollbar = { configure: jest.fn() };
    const state = fakeState();
    state.resources = buildResourceIndex([fakeDevice()]);
    type Mw = MiddlewareAPI<Everything>;
    const fakeStore: Partial<Mw> = {
      getState: () => state
    };
    versionChangeMiddleware.fn(fakeStore as Mw)(jest.fn())({ type: "ANY", payload: {} });
    expect(window.Rollbar.configure)
      .toHaveBeenCalledWith({ "payload": { "fbos": "NONE" } });
    window.Rollbar = before;
  });
});
