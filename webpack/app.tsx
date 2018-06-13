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
} from "./resources/tagged_resources";
import {
  maybeFetchUser,
  maybeGetTimeOffset,
  getFirmwareConfig
} from "./resources/selectors";
import { HotKeys } from "./hotkeys";
import { ControlsPopup } from "./controls_popup";
import { Content } from "./constants";
import { validBotLocationData, validFwConfig } from "./util";
import { Session } from "./session";
import { BooleanSetting } from "./session_keys";
import { getPathArray } from "./history";
import { FirmwareConfig } from "./config_storage/firmware_configs";
import { getWebAppConfigValue } from "./config_storage/actions";
import { takeSortedLogs } from "./logs/state_to_props";

setTimeout(() => console.log("Hello?"), 5000)

/** Remove 300ms delay on touch devices - https://github.com/ftlabs/fastclick */
const fastClick = require("fastclick");
fastClick.attach(document.body);

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
}

function mapStateToProps(props: Everything): AppProps {
  return {
    timeOffset: maybeGetTimeOffset(props.resources.index),
    dispatch: props.dispatch,
    user: maybeFetchUser(props.resources.index),
    bot: props.bot,
    logs: takeSortedLogs(250, props.resources.index),
    loaded: props.resources.loaded,
    consistent: !!(props.bot || {}).consistent,
    axisInversion: {
      x: !!Session.deprecatedGetBool(BooleanSetting.x_axis_inverted),
      y: !!Session.deprecatedGetBool(BooleanSetting.y_axis_inverted),
      z: !!Session.deprecatedGetBool(BooleanSetting.z_axis_inverted),
    },
    xySwap: !!getWebAppConfigValue(() => props)(BooleanSetting.xy_swap),
    firmwareConfig: validFwConfig(getFirmwareConfig(props.resources.index))
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
  "Point"
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
        logs={this.props.logs} />
      {!syncLoaded && <LoadingPlant />}
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
