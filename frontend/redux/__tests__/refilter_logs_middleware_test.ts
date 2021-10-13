jest.mock("../refresh_logs", () => ({ throttledLogRefresh: jest.fn() }));
import { refilterLogsMiddleware } from "../refilter_logs_middleware";
import { throttledLogRefresh } from "../refresh_logs";
import { Actions } from "../../constants";
import { ReduxAction } from "../interfaces";
import { Store } from "redux";
import { Everything } from "../../interfaces";

describe("refilterLogsMiddleware.fn()", () => {
  it("dispatches when required", () => {
    const dispatch = jest.fn();
    const fn = refilterLogsMiddleware.fn({} as Store<Everything>)(dispatch);
    fn({ type: "any", payload: {} } as unknown as ReduxAction<{}>);
    expect(throttledLogRefresh).not.toHaveBeenCalled();
    fn({ type: Actions.SAVE_RESOURCE_OK, payload: { kind: "WebAppConfig" } });
    expect(throttledLogRefresh).toHaveBeenCalled();
  });
});
