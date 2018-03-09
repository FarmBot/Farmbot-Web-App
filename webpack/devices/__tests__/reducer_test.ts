import { botReducer, initialState } from "../reducer";
import { Actions } from "../../constants";
import { ControlPanelState } from "../interfaces";
import * as _ from "lodash";
import { defensiveClone } from "../../util";
import { networkUp, networkDown } from "../../connectivity/actions";
import { stash } from "../../connectivity/data_consistency";

describe("botRedcuer", () => {
  it("Starts / stops an update", () => {
    const step1 = botReducer(initialState(), {
      type: Actions.SETTING_UPDATE_START,
      payload: undefined
    });
    expect(step1.isUpdating).toBe(true);

    const step2 = botReducer(step1, {
      type: Actions.SETTING_UPDATE_END,
      payload: undefined
    });

    expect(step2.isUpdating).toBe(false);
  });

  it("changes step size", () => {
    const state = botReducer(initialState(), {
      type: Actions.CHANGE_STEP_SIZE,
      payload: 23
    });
    expect(state.stepSize).toBe(23);
  });

  it("toggles control panel options", () => {
    const payload: keyof ControlPanelState = "danger_zone";
    const state = botReducer(initialState(), {
      type: Actions.TOGGLE_CONTROL_PANEL_OPTION,
      payload
    });
    expect(state.controlPanelState.danger_zone)
      .toBe(!initialState().controlPanelState.danger_zone);
  });

  it("bulk toggles control panel options", () => {
    const state = botReducer(initialState(), {
      type: Actions.BULK_TOGGLE_CONTROL_PANEL,
      payload: true
    });
    _.values(_.omit(state.controlPanelState, "power_and_reset"))
      .map(value => expect(value).toBeTruthy());
  });

  it("fetches OS update info", () => {
    const r = botReducer(initialState(), {
      type: Actions.FETCH_OS_UPDATE_INFO_OK,
      payload: { version: "1.2.3", commit: undefined }
    }).currentOSVersion;
    expect(r).toBe("1.2.3");
  });

  it("fetches beta OS update info", () => {
    const r = botReducer(initialState(), {
      type: Actions.FETCH_BETA_OS_UPDATE_INFO_OK,
      payload: { version: "1.2.3", commit: undefined }
    }).currentBetaOSVersion;
    expect(r).toBe("1.2.3");
  });

  it("fetches min OS feature data", () => {
    const r = botReducer(initialState(), {
      type: Actions.FETCH_MIN_OS_FEATURE_INFO_OK,
      payload: "{}"
    }).minOsFeatureData;
    expect(r).toBe("{}");
  });

  it("resets hardware state when transitioning into mainenance mode.", () => {
    const state = initialState();
    const payload = defensiveClone(state.hardware);
    payload.informational_settings.sync_status = "maintenance";
    payload.location_data.position.x = -1;
    payload.location_data.position.y = -1;
    payload.location_data.position.z = -1;
    const action = { type: Actions.BOT_CHANGE, payload };
    // Make the starting state different than initialState();
    const result = botReducer(state, action);
    // Resets .hardware to initialState()
    expect(result.hardware.location_data.position)
      .toEqual(initialState().hardware.location_data.position);
    expect(result.hardware.informational_settings.sync_status)
      .toBe("maintenance");
  });

  it("stashes/unstashes sync status based on connectivity", () => {
    const step1 = initialState();
    step1.statusStash = "booting";
    step1.hardware.informational_settings.sync_status = "synced";

    const step2 = botReducer(step1, networkDown("bot.mqtt"));
    expect(step2.statusStash)
      .toBe(step1.hardware.informational_settings.sync_status);
    expect(step2.hardware.informational_settings.sync_status).toBeUndefined();

    const step3 = botReducer(step2, networkUp("bot.mqtt"));
    expect(step3.hardware.informational_settings.sync_status)
      .toBe(step2.statusStash);
  });

  it("handles STASH_STATUS", () => {
    const step1 = initialState();
    step1.statusStash = "booting";
    step1.hardware.informational_settings.sync_status = "synced";
    const step2 = botReducer(step1, stash());
    expect(step2.statusStash)
      .toBe(step1.hardware.informational_settings.sync_status);
  });
});
