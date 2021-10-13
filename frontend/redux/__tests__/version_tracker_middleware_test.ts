jest.mock("../../devices/actions", () => ({ badVersion: jest.fn() }));

import { fakeState } from "../../__test_support__/fake_state";
import { versionChangeMiddleware } from "../version_tracker_middleware";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { AnyAction, Dispatch, MiddlewareAPI } from "redux";

describe("version tracker middleware", () => {
  it("Calls Rollbar.configure", () => {
    const before = window.Rollbar;
    window.Rollbar = { configure: jest.fn() };
    const state = fakeState();
    state.resources = buildResourceIndex([fakeDevice()]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type Mw = MiddlewareAPI<Dispatch<AnyAction>, any>;
    const fakeStore: Partial<Mw> = {
      getState: () => state
    };
    versionChangeMiddleware.fn(fakeStore as Mw)(jest.fn())({
      type: "ANY", payload: {}
    });
    expect(window.Rollbar.configure)
      .toHaveBeenCalledWith({ "payload": { "fbos": "0.0.0" } });
    window.Rollbar = before;
  });
});
