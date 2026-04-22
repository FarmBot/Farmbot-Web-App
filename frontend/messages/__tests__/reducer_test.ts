import { fakeFbosConfig } from "../../__test_support__/fake_state/resources";
import { AlertReducerState } from "../interfaces";
import { batchInitResources } from "../../connectivity/connect_device";
import { alertsReducer } from "../reducer";
import { Actions } from "../../constants";

beforeEach(() => {
  jest.clearAllMocks();
});


describe("Contextual `Alert` creation", () => {
  it("toggles on", () => {
    const c = fakeFbosConfig();
    c.body.firmware_hardware = undefined;
    const s: AlertReducerState = {
      alerts: {}
    };
    const { alerts } = alertsReducer(s, batchInitResources([c]));
    const results = Object.values(alerts);
    expect(results[0]).toEqual({
      created_at: 1,
      problem_tag: "farmbot_os.firmware.missing",
      priority: 500,
      slug: "firmware-missing",
    });
  });

  it("toggles off", () => {
    const c = fakeFbosConfig();
    const s: AlertReducerState = {
      alerts: {}
    };
    const action = {
      type: Actions.OVERWRITE_RESOURCE,
      payload: {
        uuid: c.uuid,
        update: { ...c.body, firmware_hardware: "none" },
      },
    };
    const { alerts } = alertsReducer(s, action);
    const results = Object.values(alerts);
    expect(results[0]).toEqual(undefined);
  });
});
