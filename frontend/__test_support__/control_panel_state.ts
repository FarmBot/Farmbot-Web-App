import { ControlPanelState } from "../devices/interfaces";

export const panelState = (): ControlPanelState => {
  return {
    homing_and_calibration: false,
    motors: false,
    encoders_and_endstops: false,
    danger_zone: false,
    power_and_reset: false,
    pin_guard: false
  };
};
