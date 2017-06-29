import { BotState, HardwareState, Xyz, ControlPanelState } from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
import { SyncStatus } from "farmbot/dist";
import { localStorageBoolFetch } from "../util";
import { Actions } from "../constants";

export const X_AXIS_INVERTED = "x_axis_inverted";
export const Y_AXIS_INVERTED = "y_axis_inverted";
export const Z_AXIS_INVERTED = "z_axis_inverted";

/**
 * TODO: Refactor this method to use semverCompare() now that it is a thing.
 * - RC 16 Jun 2017.
 */
export function versionOK(stringyVersion = "0.0.0",
  EXPECTED_MAJOR = 4,
  EXPECTED_MINOR = 0) {
  let [actual_major, actual_minor] = stringyVersion
    .split(".")
    .map(x => parseInt(x, 10));
  if (actual_major > EXPECTED_MAJOR) {
    return true;
  } else {
    let majorOK = (actual_major == EXPECTED_MAJOR);
    let minorOK = (actual_minor >= EXPECTED_MINOR);
    return (majorOK && minorOK);
  }
}
let initialState: BotState = {
  stepSize: 100,
  controlPanelState: {
    homing_and_calibration: false,
    motors: false,
    encoders_and_endstops: false,
    danger_zone: false
  },
  hardware: {
    mcu_params: {},
    location: [-1, -1, -1],
    pins: {},
    configuration: {},
    informational_settings: {},
    user_env: {},
    process_info: {
      farmwares: {},
    }
  },
  dirty: false,
  currentOSVersion: undefined,
  currentFWVersion: undefined,
  x_axis_inverted: !localStorageBoolFetch(X_AXIS_INVERTED),
  y_axis_inverted: !localStorageBoolFetch(Y_AXIS_INVERTED),
  z_axis_inverted: !localStorageBoolFetch(Z_AXIS_INVERTED)
};

export let botReducer = generateReducer<BotState>(initialState)
  .add<keyof ControlPanelState>(Actions.TOGGLE_CONTROL_PANEL_OPTION, (s, a) => {
    s.controlPanelState[a.payload] = !s.controlPanelState[a.payload];
    return s;
  })
  .add<number>(Actions.CHANGE_STEP_SIZE, (s, a) => {
    return Object.assign({}, s, {
      stepSize: a.payload
    });
  })
  .add<void>(Actions.SETTING_UPDATE_START, (s, a) => {
    s.isUpdating = true;
    return s;
  })
  .add<void>(Actions.SETTING_UPDATE_END, (s, a) => {
    s.isUpdating = false;
    return s;
  })
  .add<HardwareState>(Actions.BOT_CHANGE, (s, { payload }) => {
    let nextState = payload;
    s.hardware = nextState;
    versionOK(nextState.informational_settings.controller_version);
    return s;
  })
  .add<string>(Actions.FETCH_OS_UPDATE_INFO_OK, (s, { payload }) => {
    s.currentOSVersion = payload;
    return s;
  })
  .add<string>(Actions.FETCH_FW_UPDATE_INFO_OK, (s, { payload }) => {
    s.currentFWVersion = payload;
    return s;
  })
  .add<SyncStatus>(Actions.SET_SYNC_STATUS, (s, { payload }) => {
    s.hardware.informational_settings.sync_status = payload;
    return s;
  })
  .add<Xyz>(Actions.INVERT_JOG_BUTTON, (s, { payload }) => {
    switch (payload) {
      case "x":
        s.x_axis_inverted = !s.x_axis_inverted;
        localStorage.setItem(X_AXIS_INVERTED,
          JSON.stringify(localStorageBoolFetch(X_AXIS_INVERTED)));
        return s;
      case "y":
        s.y_axis_inverted = !s.y_axis_inverted;
        localStorage.setItem(Y_AXIS_INVERTED,
          JSON.stringify(localStorageBoolFetch(Y_AXIS_INVERTED)));
        return s;
      case "z":
        s.z_axis_inverted = !s.z_axis_inverted;
        localStorage.setItem(Z_AXIS_INVERTED,
          JSON.stringify(localStorageBoolFetch(Z_AXIS_INVERTED)));
        return s;
      default:
        throw new Error("Attempted to invert invalid jog button direction.")
    }
  });
