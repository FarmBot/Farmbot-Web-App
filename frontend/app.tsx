import React from "react";
import { connect, ConnectedComponent } from "react-redux";
import { error } from "./toast/toast";
import { NavBar } from "./nav";
import { Everything, TimeSettings } from "./interfaces";
import { LoadingPlant } from "./loading_plant";
import { BotState, UserEnv } from "./devices/interfaces";
import {
  ResourceName, TaggedUser, TaggedLog, Xyz, Alert, FirmwareHardware,
  TaggedWizardStepResult,
} from "farmbot";
import {
  maybeFetchUser,
  maybeGetTimeSettings,
  getDeviceAccountSettings,
  selectAllWizardStepResults,
} from "./resources/selectors";
import { HotKeys } from "./hotkeys";
import { ControlsPopup, showControlsPopup } from "./controls_popup";
import { Content } from "./constants";
import { validBotLocationData, validFwConfig } from "./util";
import { BooleanSetting } from "./session_keys";
import {
  getWebAppConfigValue, GetWebAppConfigValue,
} from "./config_storage/actions";
import { takeSortedLogs } from "./logs/state_to_props";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import { getFirmwareConfig, getFbosConfig } from "./resources/getters";
import { intersection } from "lodash";
import { t } from "./i18next_wrapper";
import { ResourceIndex } from "./resources/interfaces";
import { isBotOnlineFromState } from "./devices/must_be_online";
import { getAllAlerts } from "./messages/state_to_props";
import { PingDictionary } from "./devices/connectivity/qos";
import { getEnv } from "./farmware/state_to_props";
import { filterAlerts } from "./messages/alerts";
import {
  getFwHardwareValue,
} from "./settings/firmware/firmware_hardware_support";
import { HelpState } from "./help/reducer";
import { TourStepContainer } from "./help/new_tours";

export interface AppProps {
  dispatch: Function;
  loaded: ResourceName[];
  logs: TaggedLog[];
  user: TaggedUser | undefined;
  bot: BotState;
  consistent: boolean;
  timeSettings: TimeSettings;
  axisInversion: Record<Xyz, boolean>;
  xySwap: boolean;
  firmwareConfig: FirmwareConfig | undefined;
  animate: boolean;
  getConfigValue: GetWebAppConfigValue;
  tour: string | undefined;
  helpState: HelpState;
  resources: ResourceIndex;
  alertCount: number;
  alerts: Alert[];
  apiFirmwareValue: FirmwareHardware | undefined;
  pings: PingDictionary;
  env: UserEnv;
  authAud: string | undefined;
  wizardStepResults: TaggedWizardStepResult[];
}

export function mapStateToProps(props: Everything): AppProps {
  const webAppConfigValue = getWebAppConfigValue(() => props);
  return {
    timeSettings: maybeGetTimeSettings(props.resources.index),
    dispatch: props.dispatch,
    user: maybeFetchUser(props.resources.index),
    bot: props.bot,
    logs: takeSortedLogs(250, props.resources.index),
    loaded: props.resources.loaded,
    consistent: !!(props.bot || {}).consistent,
    axisInversion: {
      x: !!webAppConfigValue(BooleanSetting.x_axis_inverted),
      y: !!webAppConfigValue(BooleanSetting.y_axis_inverted),
      z: !!webAppConfigValue(BooleanSetting.z_axis_inverted),
    },
    xySwap: !!webAppConfigValue(BooleanSetting.xy_swap),
    firmwareConfig: validFwConfig(getFirmwareConfig(props.resources.index)),
    animate: !webAppConfigValue(BooleanSetting.disable_animations),
    getConfigValue: webAppConfigValue,
    tour: props.resources.consumers.help.currentTour,
    helpState: props.resources.consumers.help,
    resources: props.resources.index,
    alertCount: getAllAlerts(props.resources).filter(filterAlerts).length,
    alerts: getAllAlerts(props.resources),
    apiFirmwareValue: getFwHardwareValue(getFbosConfig(props.resources.index)),
    pings: props.bot.connectivity.pings,
    env: getEnv(props.resources.index),
    authAud: props.auth?.token.unencoded.aud,
    wizardStepResults: selectAllWizardStepResults(props.resources.index),
  };
}
/** Time at which the app gives up and asks the user to refresh */
const LOAD_TIME_FAILURE_MS = 25000;

/**
 * Relational resources that *must* load before app starts.
 * App will crash at load time if they are not pre-loaded.
 */
const MUST_LOAD: ResourceName[] = [
  "Sequence",
  "Regimen",
  "FarmEvent",
  "Point",
  "Device",
  "Tool", // Sequence editor needs this for rendering.
];

export class RawApp extends React.Component<AppProps, {}> {
  private get isLoaded() {
    return (MUST_LOAD.length ===
      intersection(this.props.loaded, MUST_LOAD).length);
  }

  /**
 * If the sync object takes more than 10s to load, the user will be granted
 * access into the app, but still warned.
 */
  componentDidMount() {
    setTimeout(() => {
      if (!this.isLoaded) {
        error(t(Content.APP_LOAD_TIMEOUT_MESSAGE), { title: t("Warning") });
      }
    }, LOAD_TIME_FAILURE_MS);
  }

  render() {
    const syncLoaded = this.isLoaded;
    const { bot, dispatch, getConfigValue } = this.props;
    const { location_data, mcu_params } = bot.hardware;
    return <div className="app">
      {!syncLoaded && <LoadingPlant animate={this.props.animate} />}
      <HotKeys dispatch={dispatch} />
      {syncLoaded && <NavBar
        timeSettings={this.props.timeSettings}
        consistent={this.props.consistent}
        user={this.props.user}
        bot={bot}
        dispatch={dispatch}
        logs={this.props.logs}
        getConfigValue={getConfigValue}
        tour={this.props.tour}
        helpState={this.props.helpState}
        alertCount={this.props.alertCount}
        device={getDeviceAccountSettings(this.props.resources)}
        alerts={this.props.alerts}
        apiFirmwareValue={this.props.apiFirmwareValue}
        authAud={this.props.authAud}
        wizardStepResults={this.props.wizardStepResults}
        pings={this.props.pings} />}
      {syncLoaded && this.props.children}
      {showControlsPopup() &&
        <ControlsPopup
          dispatch={dispatch}
          botPosition={validBotLocationData(location_data).position}
          firmwareSettings={this.props.firmwareConfig || mcu_params}
          arduinoBusy={!!bot.hardware.informational_settings.busy}
          botOnline={isBotOnlineFromState(bot)}
          getConfigValue={getConfigValue}
          env={this.props.env}
          stepSize={bot.stepSize} />}
      <TourStepContainer
        dispatch={dispatch}
        helpState={this.props.helpState} />
    </div>;
  }
}

export const App = connect(mapStateToProps)(
  RawApp) as ConnectedComponent<typeof RawApp, { children?: React.ReactNode }>;
