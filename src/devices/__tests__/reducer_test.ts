import { versionOK, botReducer, initialState } from "../reducer";
import { Actions } from "../../constants";
import { ControlPanelState } from "../interfaces";
import { SyncStatus } from "farmbot/dist";

describe("safeStringFetch", () => {
  it("Checks the correct version on update", () => {
    expect(versionOK("9.1.9-rc99", 3, 0)).toBeTruthy();
    expect(versionOK("3.0.9-rc99", 3, 0)).toBeTruthy();
    expect(versionOK("4.0.0", 3, 0)).toBeTruthy();
    expect(versionOK("4.0.0", 3, 1)).toBeTruthy();
    expect(versionOK("3.1.0", 3, 0)).toBeTruthy();
    expect(versionOK("2.0.-", 3, 0)).toBeFalsy();
    expect(versionOK("2.9.4", 3, 0)).toBeFalsy();
    expect(versionOK("1.9.6", 3, 0)).toBeFalsy();
    expect(versionOK("3.1.6", 4, 0)).toBeFalsy();
  });
});

describe("botRedcuer", () => {
  it("Starts / stops an update", () => {
    let step1 = botReducer(initialState, {
      type: Actions.SETTING_UPDATE_START,
      payload: undefined
    });
    expect(step1.isUpdating).toBe(true);

    let step2 = botReducer(step1, {
      type: Actions.SETTING_UPDATE_END,
      payload: undefined
    });

    expect(step2.isUpdating).toBe(false);
  });

  it("changes step size", () => {
    let state = botReducer(initialState, {
      type: Actions.CHANGE_STEP_SIZE,
      payload: 23
    });
    expect(state.stepSize).toBe(23);
  });

  it("toggles control panel options", () => {
    let payload: keyof ControlPanelState = "danger_zone";
    let state = botReducer(initialState, {
      type: Actions.TOGGLE_CONTROL_PANEL_OPTION,
      payload
    });
    expect(state.controlPanelState.danger_zone)
      .toBe(!initialState.controlPanelState.danger_zone);
  });

  it("fetches OS update info", () => {
    let r = botReducer(initialState, {
      type: Actions.FETCH_OS_UPDATE_INFO_OK,
      payload: "1.2.3"
    }).currentOSVersion;
    expect(r).toBe("1.2.3");
  });

  it("sets sync status", () => {
    let payload: SyncStatus = "locked";
    let state = botReducer(initialState, {
      type: Actions.SET_SYNC_STATUS,
      payload
    });
    expect(initialState.hardware.informational_settings.sync_status)
      .not.toBe(payload);
    expect(state.hardware.informational_settings.sync_status)
      .toBe(payload);
  });

  it("inverts X/Y/Z", () => {
    let action = { type: Actions.INVERT_JOG_BUTTON, payload: "Q" };
    expect(() => { botReducer(initialState, action); }).toThrow();

    action.payload = "x";
    let result = botReducer(initialState, action);
    expect(result.x_axis_inverted)
      .toBe(!initialState.x_axis_inverted);

    action.payload = "y";
    expect(botReducer(initialState, action).y_axis_inverted)
      .toBe(!initialState.y_axis_inverted);

    action.payload = "z";
    expect(botReducer(initialState, action).z_axis_inverted)
      .toBe(!initialState.z_axis_inverted);

  });
});
