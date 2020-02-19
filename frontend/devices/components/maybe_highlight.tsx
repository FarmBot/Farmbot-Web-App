import * as React from "react";
import { ControlPanelState } from "../interfaces";
import { toggleControlPanel } from "../actions";
import { urlFriendly } from "../../util";
import { DeviceSetting } from "../../constants";

const HOMING_PANEL = [
  DeviceSetting.homingAndCalibration,
  DeviceSetting.homing,
  DeviceSetting.calibration,
  DeviceSetting.setZeroPosition,
  DeviceSetting.findHomeOnBoot,
  DeviceSetting.stopAtHome,
  DeviceSetting.stopAtMax,
  DeviceSetting.negativeCoordinatesOnly,
  DeviceSetting.axisLength,
];
const MOTORS_PANEL = [
  DeviceSetting.motors,
  DeviceSetting.maxSpeed,
  DeviceSetting.homingSpeed,
  DeviceSetting.minimumSpeed,
  DeviceSetting.accelerateFor,
  DeviceSetting.stepsPerMm,
  DeviceSetting.microstepsPerStep,
  DeviceSetting.alwaysPowerMotors,
  DeviceSetting.invertMotors,
  DeviceSetting.motorCurrent,
  DeviceSetting.enable2ndXMotor,
  DeviceSetting.invert2ndXMotor,
];
const ENCODERS_PANEL = [
  DeviceSetting.encoders,
  DeviceSetting.stallDetection,
  DeviceSetting.enableEncoders,
  DeviceSetting.enableStallDetection,
  DeviceSetting.stallSensitivity,
  DeviceSetting.useEncodersForPositioning,
  DeviceSetting.invertEncoders,
  DeviceSetting.maxMissedSteps,
  DeviceSetting.missedStepDecay,
  DeviceSetting.encoderScaling,
];
const ENDSTOPS_PANEL = [
  DeviceSetting.endstops,
  DeviceSetting.enableEndstops,
  DeviceSetting.swapEndstops,
  DeviceSetting.invertEndstops,
];
const ERROR_HANDLING_PANEL = [
  DeviceSetting.errorHandling,
  DeviceSetting.timeoutAfter,
  DeviceSetting.maxRetries,
  DeviceSetting.estopOnMovementError,
];
const PIN_GUARD_PANEL = [
  DeviceSetting.pinGuard,
];
const DANGER_ZONE_PANEL = [
  DeviceSetting.dangerZone,
  DeviceSetting.resetHardwareParams,
];
const PIN_BINDINGS_PANEL = [
  DeviceSetting.pinBindings,
];
const POWER_AND_RESET_PANEL = [
  DeviceSetting.powerAndReset,
  DeviceSetting.restartFarmbot,
  DeviceSetting.shutdownFarmbot,
  DeviceSetting.restartFirmware,
  DeviceSetting.factoryReset,
  DeviceSetting.autoFactoryReset,
  DeviceSetting.connectionAttemptPeriod,
  DeviceSetting.changeOwnership,
];

/** Look up parent panels for settings. */
const SETTING_PANEL_LOOKUP = {} as Record<DeviceSetting, keyof ControlPanelState>;
HOMING_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "homing_and_calibration");
MOTORS_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "motors");
ENCODERS_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "encoders");
ENDSTOPS_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "endstops");
ERROR_HANDLING_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "error_handling");
PIN_GUARD_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "pin_guard");
DANGER_ZONE_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "danger_zone");
PIN_BINDINGS_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "pin_bindings");
POWER_AND_RESET_PANEL.map(s => SETTING_PANEL_LOOKUP[s] = "power_and_reset");

/** Look up parent panels for settings using URL-friendly names. */
const URL_FRIENDLY_LOOKUP: Record<string, keyof ControlPanelState> = {};
Object.entries(SETTING_PANEL_LOOKUP).map(([setting, panel]) =>
  URL_FRIENDLY_LOOKUP[urlFriendly(setting)] = panel);

/** Look up all relevant names for the same setting. */
const ALTERNATE_NAMES =
  Object.values(DeviceSetting).reduce((acc, s) => { acc[s] = [s]; return acc; },
    {} as Record<DeviceSetting, DeviceSetting[]>);
ALTERNATE_NAMES[DeviceSetting.encoders].push(DeviceSetting.stallDetection);
ALTERNATE_NAMES[DeviceSetting.stallDetection].push(DeviceSetting.encoders);

/** Generate array of names for the same setting. Most only have one. */
const compareValues = (settingName: DeviceSetting) =>
  (ALTERNATE_NAMES[settingName]).map(s => urlFriendly(s));

/** Retrieve a highlight search term. */
const getHighlightName = () => location.search.split("?highlight=").pop();

/** Only open panel and highlight once per app load. Exported for tests. */
export const highlight = { opened: false, highlighted: false };

/** Open a panel if a setting in that panel is highlighted. */
export const maybeOpenPanel = (panelState: ControlPanelState) =>
  (dispatch: Function) => {
    if (highlight.opened) { return; }
    const urlFriendlySettingName = urlFriendly(getHighlightName() || "");
    if (!urlFriendlySettingName) { return; }
    const panel = URL_FRIENDLY_LOOKUP[urlFriendlySettingName];
    const panelIsOpen = panelState[panel];
    if (panelIsOpen) { return; }
    dispatch(toggleControlPanel(panel));
    highlight.opened = true;
  };

/** Highlight a setting if provided as a search term. */
export const maybeHighlight = (settingName: DeviceSetting) => {
  const item = getHighlightName();
  if (highlight.highlighted || !item) { return ""; }
  const isCurrentSetting = compareValues(settingName).includes(item);
  if (!isCurrentSetting) { return ""; }
  highlight.highlighted = true;
  return "highlight";
};

export interface HighlightProps {
  settingName: DeviceSetting;
  children: React.ReactChild
  | React.ReactChild[]
  | (React.ReactChild | React.ReactChild[])[];
  className?: string;
}

interface HighlightState {
  className: string;
}

/** Wrap highlight-able settings. */
export class Highlight extends React.Component<HighlightProps, HighlightState> {
  state: HighlightState = { className: maybeHighlight(this.props.settingName) };

  componentDidMount = () => {
    if (this.state.className == "highlight") {
      /** Slowly fades highlight. */
      this.setState({ className: "unhighlight" });
    }
  }

  render() {
    return <div className={`${this.props.className} ${this.state.className}`}>
      {this.props.children}
    </div>;
  }
}
