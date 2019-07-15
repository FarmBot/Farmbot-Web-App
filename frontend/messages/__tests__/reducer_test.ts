import { fakeFbosConfig } from "../../__test_support__/fake_state/resources";
import { AlertReducerState } from "../interfaces";
import { batchInitResources } from "../../connectivity/connect_device";
import { alertsReducer } from "../reducer";
import { overwrite } from "../../api/crud";

describe("Contextual `Alert` creation", () => {
  it("toggles on", () => {
    const c = fakeFbosConfig();
    // tslint:disable-next-line:no-any
    c.body.firmware_hardware = undefined as any;
    const s: AlertReducerState = {
      alerts: {}
    };
    const { alerts } = alertsReducer(s, batchInitResources([c]));
    const results = Object.values(alerts);
    expect(results[0]).toEqual({
      created_at: 1,
      problem_tag: "farmbot_os.firmware.missing",
      priority: 0,
      slug: "firmware-missing",
    });
  });

  it("toggles off", () => {
    const c = fakeFbosConfig();
    const s: AlertReducerState = {
      alerts: {}
    };
    const action =
      overwrite(c, { ...c.body, firmware_hardware: "none" });
    const { alerts } = alertsReducer(s, action);
    const results = Object.values(alerts);
    expect(results[0]).toEqual(undefined);
  });
});
