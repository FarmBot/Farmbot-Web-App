import { generateReducer } from "./redux/generate_reducer";
import { Actions } from "./constants";
import { ToastMessageProps, ToastMessages } from "./toast/interfaces";
import {
  ControlsState,
  CurvesPanelState,
  JobsAndLogsState,
  MetricPanelState,
  MovementState,
  PlantsPanelState,
  PointsPanelState,
  PopupsState,
  SequencesPanelState,
  SettingsPanelState,
  WeedsPanelState,
} from "./interfaces";

export interface AppState {
  settingsSearchTerm: string;
  settingsPanelState: SettingsPanelState;
  plantsPanelState: PlantsPanelState;
  weedsPanelState: WeedsPanelState;
  pointsPanelState: PointsPanelState;
  curvesPanelState: CurvesPanelState;
  sequencesPanelState: SequencesPanelState;
  metricPanelState: MetricPanelState;
  toasts: ToastMessages;
  movement: MovementState,
  jobs: JobsAndLogsState;
  controls: ControlsState;
  popups: PopupsState;
}

export const emptyState = (): AppState => {
  return {
    settingsSearchTerm: "",
    settingsPanelState: {
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
    },
    plantsPanelState: {
      groups: false,
      savedGardens: false,
      plants: true,
    },
    weedsPanelState: {
      groups: false,
      pending: true,
      active: true,
      removed: true,
    },
    pointsPanelState: {
      groups: false,
      points: true,
      soilHeight: false,
    },
    curvesPanelState: {
      water: true,
      spread: true,
      height: true,
    },
    sequencesPanelState: {
      sequences: true,
      featured: false,
    },
    metricPanelState: {
      realtime: true,
      network: false,
      history: false,
    },
    toasts: {},
    controls: {
      move: true,
      peripherals: false,
      webcams: false,
    },
    jobs: {
      jobs: true,
      logs: false,
    },
    movement: {
      start: { x: undefined, y: undefined, z: undefined },
      distance: { x: 0, y: 0, z: 0 },
    },
    popups: {
      timeTravel: false,
      controls: false,
      jobs: false,
      connectivity: false,
    },
  };
};

export const appReducer =
  generateReducer<AppState>(emptyState())
    .add<string>(Actions.SET_SETTINGS_SEARCH_TERM, (s, { payload }) => {
      s.settingsSearchTerm = payload;
      return s;
    })
    .add<keyof SettingsPanelState>(Actions.TOGGLE_SETTINGS_PANEL_OPTION, (s, a) => {
      s.settingsPanelState[a.payload] = !s.settingsPanelState[a.payload];
      return s;
    })
    .add<keyof PlantsPanelState>(Actions.TOGGLE_PLANTS_PANEL_OPTION, (s, a) => {
      s.plantsPanelState[a.payload] = !s.plantsPanelState[a.payload];
      return s;
    })
    .add<keyof WeedsPanelState>(Actions.TOGGLE_WEEDS_PANEL_OPTION, (s, a) => {
      s.weedsPanelState[a.payload] = !s.weedsPanelState[a.payload];
      return s;
    })
    .add<keyof PointsPanelState>(Actions.TOGGLE_POINTS_PANEL_OPTION, (s, a) => {
      s.pointsPanelState[a.payload] = !s.pointsPanelState[a.payload];
      return s;
    })
    .add<keyof CurvesPanelState>(Actions.TOGGLE_CURVES_PANEL_OPTION, (s, a) => {
      s.curvesPanelState[a.payload] = !s.curvesPanelState[a.payload];
      return s;
    })
    .add<keyof SequencesPanelState>(
      Actions.TOGGLE_SEQUENCES_PANEL_OPTION, (s, a) => {
        s.sequencesPanelState[a.payload] = !s.sequencesPanelState[a.payload];
        return s;
      })
    .add<keyof MetricPanelState>(Actions.SET_METRIC_PANEL_OPTION, (s, a) => {
      s.metricPanelState.realtime = false;
      s.metricPanelState.network = false;
      s.metricPanelState.history = false;
      s.metricPanelState[a.payload] = true;
      return s;
    })
    .add<boolean>(
      Actions.BULK_TOGGLE_SETTINGS_PANEL, (s, a) => {
        s.settingsPanelState.farmbot_settings = a.payload;
        s.settingsPanelState.firmware = a.payload;
        s.settingsPanelState.power_and_reset = a.payload;
        s.settingsPanelState.axis_settings = a.payload;
        s.settingsPanelState.motors = a.payload;
        s.settingsPanelState.encoders_or_stall_detection = a.payload;
        s.settingsPanelState.limit_switches = a.payload;
        s.settingsPanelState.error_handling = a.payload;
        s.settingsPanelState.pin_bindings = a.payload;
        s.settingsPanelState.pin_guard = a.payload;
        s.settingsPanelState.pin_reporting = a.payload;
        s.settingsPanelState.parameter_management = a.payload;
        s.settingsPanelState.custom_settings = a.payload;
        s.settingsPanelState.farm_designer = a.payload;
        s.settingsPanelState.three_d = a.payload;
        s.settingsPanelState.account = a.payload;
        s.settingsPanelState.other_settings = a.payload;
        return s;
      })
    .add<keyof ControlsState>(
      Actions.SET_CONTROLS_PANEL_OPTION, (s, { payload }) => {
        s.controls.move = false;
        s.controls.peripherals = false;
        s.controls.webcams = false;
        s.controls[payload] = true;
        return s;
      })
    .add<keyof JobsAndLogsState>(
      Actions.SET_JOBS_PANEL_OPTION, (s, { payload }) => {
        s.jobs.jobs = false;
        s.jobs.logs = false;
        s.jobs[payload] = true;
        return s;
      })
    .add<keyof PopupsState>(Actions.TOGGLE_POPUP, (s, { payload }) => {
      const newState = !s.popups[payload];
      s.popups.timeTravel = false;
      s.popups.controls = false;
      s.popups.jobs = false;
      s.popups.connectivity = false;
      s.popups[payload] = newState;
      return s;
    })
    .add<keyof PopupsState>(Actions.OPEN_POPUP, (s, { payload }) => {
      s.popups.timeTravel = false;
      s.popups.controls = false;
      s.popups.jobs = false;
      s.popups.connectivity = false;
      s.popups[payload] = true;
      return s;
    })
    .add<undefined>(Actions.CLOSE_POPUP, (s) => {
      s.popups.timeTravel = false;
      s.popups.controls = false;
      s.popups.jobs = false;
      s.popups.connectivity = false;
      return s;
    })
    .add<ToastMessageProps>(Actions.CREATE_TOAST, (s, { payload }) => {
      s.toasts = { ...s.toasts, [payload.id]: payload };
      return s;
    })
    .add<MovementState>(Actions.START_MOVEMENT, (s, { payload }) => {
      s.movement = payload;
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
