import * as React from "react";
import { t } from "i18next";
import { connect } from "react-redux";
import * as _ from "lodash";
import { init, error } from "farmbot-toastr";
import { NavBar } from "./nav";
import { Everything } from "./interfaces";
import { LoadingPlant } from "./loading_plant";
import { BotState, Xyz } from "./devices/interfaces";
import {
  ResourceName, TaggedUser, TaggedLog
} from "farmbot";
import {
  maybeFetchUser,
  maybeGetTimeOffset,
} from "./resources/selectors";
import { HotKeys } from "./hotkeys";
import { ControlsPopup } from "./controls_popup";
import { Content } from "./constants";
import { validBotLocationData, validFwConfig } from "./util";
import { BooleanSetting } from "./session_keys";
import { getPathArray } from "./history";
import { getWebAppConfigValue, GetWebAppConfigValue } from "./config_storage/actions";
import { takeSortedLogs } from "./logs/state_to_props";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import { getFirmwareConfig } from "./resources/getters";

/** Remove 300ms delay on touch devices - https://github.com/ftlabs/fastclick */
// const fastClick = require("fastclick");
// fastClick.attach(document.body);

/** For the logger module */
init();

export interface AppProps {
  dispatch: Function;
  loaded: ResourceName[];
  logs: TaggedLog[];
  user: TaggedUser | undefined;
  bot: BotState;
  consistent: boolean;
  timeOffset: number;
  axisInversion: Record<Xyz, boolean>;
  xySwap: boolean;
  firmwareConfig: FirmwareConfig | undefined;
  animate: boolean;
  getConfigValue: GetWebAppConfigValue;
  tour: string | undefined;
}

function mapStateToProps(props: Everything): AppProps {
  const webAppConfigValue = getWebAppConfigValue(() => props);
  return {
    timeOffset: maybeGetTimeOffset(props.resources.index),
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
  "Tool" // Sequence editor needs this for rendering.
];

@connect(mapStateToProps)
export class App extends React.Component<AppProps, {}> {
  private get isLoaded() {
    return (MUST_LOAD.length ===
      _.intersection(this.props.loaded, MUST_LOAD).length);
  }

  /**
 * If the sync object takes more than 10s to load, the user will be granted
 * access into the app, but still warned.
 */
  componentDidMount() {
    setTimeout(() => {
      if (!this.isLoaded) {
        error(t(Content.APP_LOAD_TIMEOUT_MESSAGE), t("Warning"));
      }
    }, LOAD_TIME_FAILURE_MS);
  }

  render() {
    const syncLoaded = this.isLoaded;
    const currentPage = getPathArray()[2];
    const { location_data, mcu_params } = this.props.bot.hardware;
    return <div className="app">
      <HotKeys dispatch={this.props.dispatch} />
      <NavBar
        timeOffset={this.props.timeOffset}
        consistent={this.props.consistent}
        user={this.props.user}
        bot={this.props.bot}
        dispatch={this.props.dispatch}
        logs={this.props.logs}
        getConfigValue={this.props.getConfigValue}
        tour={this.props.tour} />
      {!syncLoaded && <LoadingPlant animate={this.props.animate} />}
      {syncLoaded && this.props.children}
      {!(["controls", "account", "regimens"].includes(currentPage)) &&
        <ControlsPopup
          dispatch={this.props.dispatch}
          axisInversion={this.props.axisInversion}
          botPosition={validBotLocationData(location_data).position}
          firmwareSettings={this.props.firmwareConfig || mcu_params}
          xySwap={this.props.xySwap}
          arduinoBusy={!!this.props.bot.hardware.informational_settings.busy}
          stepSize={this.props.bot.stepSize} />}
    </div>;
  }
}
