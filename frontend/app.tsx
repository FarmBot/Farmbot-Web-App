import React from "react";
import { connect, ConnectedComponent } from "react-redux";
import { init, error } from "./toast/toast";
import { NavBar } from "./nav";
import { Everything, TimeSettings } from "./interfaces";
import { LoadingPlant } from "./loading_plant";
import { BotState, UserEnv } from "./devices/interfaces";
import {
  ResourceName, TaggedUser, TaggedLog, Xyz, Alert, FirmwareHardware,
} from "farmbot";
import {
  maybeFetchUser,
  maybeGetTimeSettings,
  getDeviceAccountSettings,
} from "./resources/selectors";
import { HotKeys } from "./hotkeys";
import { ControlsPopup, showControlsPopup } from "./controls_popup";
import { Content } from "./constants";
import { validBotLocationData, validFwConfig, validFbosConfig } from "./util";
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
import { getEnv, getShouldDisplayFn } from "./farmware/state_to_props";
import { filterAlerts } from "./messages/alerts";
import {
  isFwHardwareValue,
} from "./settings/firmware/firmware_hardware_support";

/** For the logger module */
init();

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
  resources: ResourceIndex;
  alertCount: number;
  alerts: Alert[];
  apiFirmwareValue: FirmwareHardware | undefined;
  pings: PingDictionary;
  env: UserEnv;
  authAud: string | undefined;
}

export function mapStateToProps(props: Everything): AppProps {
  const webAppConfigValue = getWebAppConfigValue(() => props);
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const fwHardware = fbosConfig?.firmware_hardware;
  const shouldDisplay = getShouldDisplayFn(props.resources.index, props.bot);
  const env = getEnv(props.resources.index, shouldDisplay, props.bot);
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
    resources: props.resources.index,
    alertCount: getAllAlerts(props.resources).filter(filterAlerts).length,
    alerts: getAllAlerts(props.resources),
    apiFirmwareValue: isFwHardwareValue(fwHardware) ? fwHardware : undefined,
    pings: props.bot.connectivity.pings,
    env,
    authAud: props.auth?.token.unencoded.aud,
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
    const { location_data, mcu_params } = this.props.bot.hardware;
    return <div className="app">
      {!syncLoaded && <LoadingPlant animate={this.props.animate} />}
      <HotKeys dispatch={this.props.dispatch} />
      {syncLoaded && <NavBar
        timeSettings={this.props.timeSettings}
        consistent={this.props.consistent}
        user={this.props.user}
        bot={this.props.bot}
        dispatch={this.props.dispatch}
        logs={this.props.logs}
        getConfigValue={this.props.getConfigValue}
        tour={this.props.tour}
        alertCount={this.props.alertCount}
        device={getDeviceAccountSettings(this.props.resources)}
        alerts={this.props.alerts}
        apiFirmwareValue={this.props.apiFirmwareValue}
        authAud={this.props.authAud}
        pings={this.props.pings} />}
      {syncLoaded && this.props.children}
      {showControlsPopup() &&
        <ControlsPopup
          dispatch={this.props.dispatch}
          axisInversion={this.props.axisInversion}
          botPosition={validBotLocationData(location_data).position}
          firmwareSettings={this.props.firmwareConfig || mcu_params}
          xySwap={this.props.xySwap}
          arduinoBusy={!!this.props.bot.hardware.informational_settings.busy}
          botOnline={isBotOnlineFromState(this.props.bot)}
          env={this.props.env}
          stepSize={this.props.bot.stepSize} />}
    </div>;
  }
}

export const App = connect(mapStateToProps)(
  RawApp) as ConnectedComponent<typeof RawApp, { children?: React.ReactNode }>;
