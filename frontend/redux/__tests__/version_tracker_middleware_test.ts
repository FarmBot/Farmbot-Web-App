import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import { Action, Dispatch, MiddlewareAPI } from "redux";
import { bot as fakeBot } from "../../__test_support__/fake_state/bot";
import { cloneDeep } from "lodash";
import * as deviceActions from "../../devices/actions";
import { Everything } from "../../interfaces";

describe("version tracker middleware", () => {
  beforeEach(() => {
    jest.spyOn(deviceActions, "badVersion")
      .mockImplementation(jest.fn());
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
    const fakeStore: Partial<MiddlewareAPI<Dispatch<Action>, Everything>> = {
      getState: () => state as unknown as Everything
    };
    versionChangeMiddleware.fn(fakeStore as unknown as import("redux").Store<
      Everything
    >)(jest.fn())({
      type: "ANY", payload: {}
    });
    expect(window.Rollbar.configure)
      .toHaveBeenCalledWith({ "payload": { "fbos": "0.0.0" } });
    window.Rollbar = before;
  });
});
