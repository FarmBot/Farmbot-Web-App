import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { AnyAction, Dispatch, MiddlewareAPI } from "redux";
import { bot as fakeBot } from "../../__test_support__/fake_state/bot";
import { cloneDeep } from "lodash";
import * as deviceActions from "../../devices/actions";

describe("version tracker middleware", () => {
  beforeEach(() => {
    jest.spyOn(deviceActions, "badVersion")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("Calls Rollbar.configure", async () => {
    const { versionChangeMiddleware } = await import("../version_tracker_middleware");
    const before = window.Rollbar;
    window.Rollbar = { configure: jest.fn() };
    const state = {
      bot: cloneDeep(fakeBot),
      resources: buildResourceIndex([fakeDevice({ fbos_version: "0.0.0" })]),
    };
    state.bot.hardware.informational_settings.controller_version = "0.0.0";
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
