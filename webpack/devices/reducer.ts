import { BotState, HardwareState, Xyz, ControlPanelState } from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
import { SyncStatus } from "farmbot/dist";
import { localStorageBoolFetch } from "../util";
import { Actions } from "../constants";
import { EncoderDisplay } from "../controls/interfaces";
import { EXPECTED_MAJOR, EXPECTED_MINOR } from "./actions";

export const X_AXIS_INVERTED = "x_axis_inverted";
export const Y_AXIS_INVERTED = "y_axis_inverted";
export const Z_AXIS_INVERTED = "z_axis_inverted";
export const RAW_ENCODERS = "raw_encoders";
export const SCALED_ENCODERS = "scaled_encoders";

/**
 * TODO: Refactor this method to use semverCompare() now that it is a thing.
 * - RC 16 Jun 2017.
 */
export function versionOK(stringyVersion = "0.0.0",
  _EXPECTED_MAJOR = EXPECTED_MAJOR,
  _EXPECTED_MINOR = EXPECTED_MINOR) {
  let [actual_major, actual_minor] = stringyVersion
    .split(".")
    .map(x => parseInt(x, 10));
  if (actual_major > _EXPECTED_MAJOR) {
    return true;
  } else {
    let majorOK = (actual_major == _EXPECTED_MAJOR);
    let minorOK = (actual_minor >= _EXPECTED_MINOR);
    return (majorOK && minorOK);
  }
}
export let initialState: BotState = {
  connectedToMQTT: false,
  stepSize: 100,
  controlPanelState: {
    homing_and_calibration: false,
    motors: false,
    encoders_and_endstops: false,
    danger_zone: false
  },
  hardware: {
    mcu_params: {},
    jobs: {},
    location_data: {
      "position": {
        x: undefined,
        y: undefined,
        z: undefined
      },
      "scaled_encoders": {
        x: undefined,
        y: undefined,
        z: undefined
      },
      "raw_encoders": {
        x: undefined,
        y: undefined,
        z: undefined
      },
    },
    pins: {},
    configuration: {},
    informational_settings: {
      busy: false,
      locked: false
    },
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
  z_axis_inverted: !localStorageBoolFetch(Z_AXIS_INVERTED),
  raw_encoders: !localStorageBoolFetch(RAW_ENCODERS),
  scaled_encoders: !localStorageBoolFetch(SCALED_ENCODERS)
};

export let botReducer = generateReducer<BotState>(initialState)
  .add<void>(Actions.SETTING_UPDATE_START, (s, a) => {
    s.isUpdating = true;
    return s;
  })
  .add<void>(Actions.SETTING_UPDATE_END, (s, a) => {
    s.isUpdating = false;
    return s;
  })
  .add<number>(Actions.CHANGE_STEP_SIZE, (s, a) => {
    return Object.assign({}, s, {
      stepSize: a.payload
    });
  })
  .add<keyof ControlPanelState>(Actions.TOGGLE_CONTROL_PANEL_OPTION, (s, a) => {
    s.controlPanelState[a.payload] = !s.controlPanelState[a.payload];
    return s;
  })
  .add<string>(Actions.FETCH_OS_UPDATE_INFO_OK, (s, { payload }) => {
    s.currentOSVersion = payload;
    return s;
  })
  .add<HardwareState>(Actions.BOT_CHANGE, (s, { payload }) => {
    let nextState = payload;
    s.hardware = nextState;
    versionOK(nextState.informational_settings.controller_version);
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
        throw new Error("Attempted to invert invalid jog button direction.");
    }
  })
  .add<EncoderDisplay>(Actions.DISPLAY_ENCODER_DATA, (s, { payload }) => {
    switch (payload) {
      case "raw_encoders":
        s.raw_encoders = !s.raw_encoders;
        localStorage.setItem(RAW_ENCODERS,
          JSON.stringify(localStorageBoolFetch(RAW_ENCODERS)));
        return s;
      case "scaled_encoders":
        s.scaled_encoders = !s.scaled_encoders;
        localStorage.setItem(SCALED_ENCODERS,
          JSON.stringify(localStorageBoolFetch(SCALED_ENCODERS)));
        return s;
      default:
        throw new Error("Attempted to toggle display of invalid data.");
    }
  })
  .add<boolean>(Actions.SET_MQTT_STATUS, (s, a) => {
    s.connectedToMQTT = a.payload;
    return s;
  });
