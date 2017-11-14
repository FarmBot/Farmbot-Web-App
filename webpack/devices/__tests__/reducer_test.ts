import { versionOK, botReducer, initialState } from "../reducer";
import { Actions } from "../../constants";
import { ControlPanelState } from "../interfaces";
import * as _ from "lodash";

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
    const step1 = botReducer(initialState, {
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
    const state = botReducer(initialState, {
      type: Actions.CHANGE_STEP_SIZE,
      payload: 23
    });
    expect(state.stepSize).toBe(23);
  });

  it("toggles control panel options", () => {
    const payload: keyof ControlPanelState = "danger_zone";
    const state = botReducer(initialState, {
      type: Actions.TOGGLE_CONTROL_PANEL_OPTION,
      payload
    });
    expect(state.controlPanelState.danger_zone)
      .toBe(!initialState.controlPanelState.danger_zone);
  });

  it("bulk toggles control panel options", () => {
    const state = botReducer(initialState, {
      type: Actions.BULK_TOGGLE_CONTROL_PANEL,
      payload: true
    });
    _.values(state.controlPanelState).map(value => expect(value).toBeTruthy());
  });

  it("fetches OS update info", () => {
    const r = botReducer(initialState, {
      type: Actions.FETCH_OS_UPDATE_INFO_OK,
      payload: "1.2.3"
    }).currentOSVersion;
    expect(r).toBe("1.2.3");
  });

  it("inverts X/Y/Z", () => {
    const action = { type: Actions.INVERT_JOG_BUTTON, payload: "Q" };

    action.payload = "x";
    const result = botReducer(initialState, action);
    expect(result.axis_inversion.x)
      .toBe(!initialState.axis_inversion.x);

    action.payload = "y";
    expect(botReducer(initialState, action).axis_inversion.y)
      .toBe(!initialState.axis_inversion.y);

    action.payload = "z";
    expect(botReducer(initialState, action).axis_inversion.z)
      .toBe(!initialState.axis_inversion.z);

  });

  it("toggles encoder data display", () => {
    const action = { type: Actions.DISPLAY_ENCODER_DATA, payload: "Q" };

    action.payload = "raw_encoders";
    const result = botReducer(initialState, action);
    expect(result.encoder_visibility.raw_encoders)
      .toBe(!initialState.encoder_visibility.raw_encoders);

    action.payload = "scaled_encoders";
    expect(botReducer(initialState, action).encoder_visibility.scaled_encoders)
      .toBe(!initialState.encoder_visibility.scaled_encoders);

  });
});
