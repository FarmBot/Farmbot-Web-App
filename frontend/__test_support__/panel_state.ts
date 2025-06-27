import {
  SettingsPanelState,
  PlantsPanelState,
  WeedsPanelState,
  PointsPanelState,
  SequencesPanelState,
  MetricPanelState,
  CurvesPanelState,
  JobsAndLogsState,
  ControlsState,
  PopupsState,
} from "../interfaces";

export const settingsPanelState = (): SettingsPanelState => {
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
    pin_reporting: false,
    parameter_management: false,
    custom_settings: false,
    farm_designer: false,
    three_d: false,
    account: false,
    other_settings: false,
  };
};

export const plantsPanelState = (): PlantsPanelState => ({
  groups: false,
  savedGardens: false,
  plants: true,
});

export const weedsPanelState = (): WeedsPanelState => ({
  groups: false,
  pending: true,
  active: true,
  removed: true,
});

export const pointsPanelState = (): PointsPanelState => ({
  groups: false,
  points: true,
  soilHeight: false,
});

export const curvesPanelState = (): CurvesPanelState => ({
  water: false,
  spread: false,
  height: false,
});

export const sequencesPanelState = (): SequencesPanelState => ({
  sequences: true,
  featured: false,
});

export const metricPanelState = (): MetricPanelState => ({
  realtime: true,
  network: false,
  history: false,
});

export const controlsState = (): ControlsState => ({
  move: true,
  peripherals: false,
  webcams: false,
});

export const jobsState = (): JobsAndLogsState => ({
  jobs: true,
  logs: false,
});

export const popUpsState = (): PopupsState => ({
  timeTravel: false,
  controls: false,
  jobs: false,
  connectivity: false,
});
