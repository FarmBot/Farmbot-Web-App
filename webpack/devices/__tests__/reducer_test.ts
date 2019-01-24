import { botReducer, initialState } from "../reducer";
import { Actions } from "../../constants";
import { ControlPanelState } from "../interfaces";
import * as _ from "lodash";
import { defensiveClone } from "../../util";
import { networkUp, networkDown } from "../../connectivity/actions";
import { stash } from "../../connectivity/data_consistency";
import { incomingStatus } from "../../connectivity/connect_device";
import { Vector3 } from "farmbot";

describe("botReducer", () => {
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

    const bulkToggable =
      _.omit(state.controlPanelState, "power_and_reset", "diagnostic_dumps");
    _.values(bulkToggable).map(value => {
      expect(value).toBeTruthy();
    });
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
      payload: {}
    }).minOsFeatureData;
    expect(r).toEqual({});
  });

  it("Handles status_v8 info", () => {
    const n = () => Math.round(Math.random() * 1000);
    const position: Vector3 = { x: n(), y: n(), z: n() };
    const state = initialState();
    state.hardware.informational_settings.sync_status = "synced";
    const action = incomingStatus({ location_data: { position } });
    const r = botReducer(state, action);
    expect(r.hardware.location_data.position).toEqual(position);
  });

  it("resets hardware state when transitioning into maintenance mode.", () => {
    const state = initialState();
    const payload = defensiveClone(state.hardware);
    payload.informational_settings.sync_status = "maintenance";
    payload.location_data.position.x = -1;
    payload.location_data.position.y = -1;
    payload.location_data.position.z = -1;
    const action = { type: Actions.LEGACY_BOT_CHANGE, payload };
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

    const step2 = botReducer(step1, networkDown("bot.mqtt", undefined, "tests"));
    expect(step2.statusStash)
      .toBe(step1.hardware.informational_settings.sync_status);
    expect(step2.hardware.informational_settings.sync_status).toBeUndefined();

    const step3 = botReducer(step1, networkDown("bot.mqtt", undefined, "tests"));
    expect(step3.statusStash)
      .toBe(step1.hardware.informational_settings.sync_status);
    expect(step3.hardware.informational_settings.sync_status).toBeUndefined();

    const step4 = botReducer(step3, networkUp("bot.mqtt", undefined, "tests"));
    expect(step4.hardware.informational_settings.sync_status)
      .toBe(step3.statusStash);
  });

  it("handles STASH_STATUS / _RESOURCE_NO", () => {
    const step1 = initialState();
    step1.statusStash = "booting";
    step1.hardware.informational_settings.sync_status = "synced";
    const step2 = botReducer(step1, stash());
    expect(step2.statusStash)
      .toBe(step1.hardware.informational_settings.sync_status);
    const no = { type: Actions._RESOURCE_NO, payload: undefined };
    const step3 = botReducer(step2, no);
    expect(step3.hardware.informational_settings.sync_status)
      .toBe(step3.statusStash);
  });
});
