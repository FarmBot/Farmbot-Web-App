import { ControlPanelState } from "../devices/interfaces";

export const panelState = (): ControlPanelState => {
  return {
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
  };
};
