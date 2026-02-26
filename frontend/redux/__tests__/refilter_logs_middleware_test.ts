import { refilterLogsMiddleware } from "../refilter_logs_middleware";
import * as refreshLogsModule from "../refresh_logs";
import { Actions } from "../../constants";
import { Store } from "redux";
import { Everything } from "../../interfaces";

describe("refilterLogsMiddleware.fn()", () => {
  let throttledLogRefreshSpy: jest.SpyInstance;
  const dispatch = jest.fn();
  const fn = refilterLogsMiddleware.fn({} as Store<Everything>)(dispatch);

  beforeEach(() => {
    jest.clearAllMocks();
    throttledLogRefreshSpy = jest.spyOn(refreshLogsModule, "throttledLogRefresh")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    throttledLogRefreshSpy.mockRestore();
  });

  it("ignores unrelated and incomplete actions", () => {
    fn({ type: Actions.SET_PANEL_OPEN, payload: false as unknown as object });
    fn({ type: Actions.SAVE_RESOURCE_OK, payload: { kind: "Point" } });
    expect(throttledLogRefreshSpy).not.toHaveBeenCalled();
  });

  it("ignores non log filter WebAppConfig changes", () => {
    fn({
      type: Actions.SAVE_RESOURCE_OK,
      payload: { kind: "WebAppConfig", body: { show_plants: true } },
    });
    expect(throttledLogRefreshSpy).not.toHaveBeenCalled();
  });

  it("triggers refresh when log filter changes", () => {
    fn({
      type: Actions.SAVE_RESOURCE_OK,
      payload: { kind: "WebAppConfig", body: { success_log: 3 } },
    });
    expect(throttledLogRefreshSpy).toHaveBeenCalledTimes(1);
  });

  it("does not trigger refresh if log filter value is unchanged", () => {
    fn({
      type: Actions.SAVE_RESOURCE_OK,
      payload: { kind: "WebAppConfig", body: { info_log: 3 } },
    });
    expect(throttledLogRefreshSpy).toHaveBeenCalledTimes(1);
    jest.clearAllMocks();
    fn({
      type: Actions.SAVE_RESOURCE_OK,
      payload: { kind: "WebAppConfig", body: { info_log: 3 } },
    });
    expect(throttledLogRefreshSpy).not.toHaveBeenCalled();
  });
});
