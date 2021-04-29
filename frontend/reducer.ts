import { generateReducer } from "./redux/generate_reducer";
import { Actions } from "./constants";
import { ToastMessageProps, ToastMessages } from "./toast/interfaces";
import { ControlPanelState } from "./devices/interfaces";

export interface AppState {
  controlPanelState: ControlPanelState;
  toasts: ToastMessages;
}

export const emptyState = (): AppState => {
  return {
    controlPanelState: {
      farmbot_settings: false,
      firmware: false,
      power_and_reset: false,
      axis_settings: false,
      motors: false,
      encoders_or_stall_detection: false,
      limit_switches: false,
      error_handling: false,
      pin_bindings: false,
      pin_guard: false,
      parameter_management: false,
      farm_designer: false,
      account: false,
      other_settings: false,
    },
    toasts: {},
  };
};

export const appReducer =
  generateReducer<AppState>(emptyState())
    .add<keyof ControlPanelState>(Actions.TOGGLE_CONTROL_PANEL_OPTION, (s, a) => {
      s.controlPanelState[a.payload] = !s.controlPanelState[a.payload];
      return s;
    })
    .add<boolean>(
      Actions.BULK_TOGGLE_CONTROL_PANEL, (s, a) => {
        s.controlPanelState.farmbot_settings = a.payload;
        s.controlPanelState.firmware = a.payload;
        s.controlPanelState.power_and_reset = a.payload;
        s.controlPanelState.axis_settings = a.payload;
        s.controlPanelState.motors = a.payload;
        s.controlPanelState.encoders_or_stall_detection = a.payload;
        s.controlPanelState.limit_switches = a.payload;
        s.controlPanelState.error_handling = a.payload;
        s.controlPanelState.pin_bindings = a.payload;
        s.controlPanelState.pin_guard = a.payload;
        s.controlPanelState.parameter_management = a.payload;
        s.controlPanelState.farm_designer = a.payload;
        s.controlPanelState.account = a.payload;
        s.controlPanelState.other_settings = a.payload;
        return s;
      })
    .add<ToastMessageProps>(Actions.CREATE_TOAST, (s, { payload }) => {
      s.toasts = { ...s.toasts, [payload.id]: payload };
      return s;
    })
    .add<string>(Actions.REMOVE_TOAST, (s, { payload }) => {
      const newToastLookup: ToastMessages = {};
      Object.values(s.toasts)
        .filter(toast => !toast.id.startsWith(payload))
        .map(toast => { newToastLookup[toast.id] = toast; });
      s.toasts = newToastLookup;
      return s;
    });
