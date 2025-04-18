jest.mock("../refresh_logs", () => ({ throttledLogRefresh: jest.fn() }));
import { refilterLogsMiddleware } from "../refilter_logs_middleware";
import { throttledLogRefresh } from "../refresh_logs";
import { Actions } from "../../constants";
import { ReduxAction } from "../interfaces";
import { Store } from "redux";
import { Everything } from "../../interfaces";

describe("refilterLogsMiddleware.fn()", () => {
  let dispatch: jest.Mock;
  let fn: ReturnType<ReturnType<typeof refilterLogsMiddleware.fn>>;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = jest.fn();
    fn = refilterLogsMiddleware.fn({} as Store<Everything>)(dispatch);
  });

  it("ignores unrelated and incomplete actions", () => {
    fn({ type: "any", payload: {} } as unknown as ReduxAction<{}>);
    fn({ type: Actions.SAVE_RESOURCE_OK } as any);
    fn({ type: Actions.SAVE_RESOURCE_OK, payload: {} } as any);
    fn({ type: Actions.SAVE_RESOURCE_OK, payload: { kind: "WebAppConfig" } } as any);
    expect(throttledLogRefresh).not.toHaveBeenCalled();
  });

  it("ignores non log filter WebAppConfig changes", () => {
    fn({
      type: Actions.SAVE_RESOURCE_OK,
      payload: { kind: "WebAppConfig", body: { show_plants: true } },
    });
    expect(throttledLogRefresh).not.toHaveBeenCalled();
  });

  it("triggers refresh when log filter changes", () => {
    fn({
      type: Actions.SAVE_RESOURCE_OK,
      payload: { kind: "WebAppConfig", body: { success_log: 3 } },
    });
    expect(throttledLogRefresh).toHaveBeenCalledTimes(1);
  });
});
