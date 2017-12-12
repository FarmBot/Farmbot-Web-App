import * as React from "react";
import { t } from "i18next";
import { connect } from "react-redux";
import * as _ from "lodash";
import { init, error } from "farmbot-toastr";

import { NavBar } from "./nav";
import { Everything, Log } from "./interfaces";
import { LoadingPlant } from "./loading_plant";
import { BotState } from "./devices/interfaces";
import { ResourceName, TaggedUser } from "./resources/tagged_resources";
import { selectAllLogs, maybeFetchUser } from "./resources/selectors";
import { HotKeys } from "./hotkeys";
import { ControlsPopup } from "./controls_popup";
import { Content } from "./constants";
import { catchErrors } from "./util";

/** Remove 300ms delay on touch devices - https://github.com/ftlabs/fastclick */
const fastClick = require("fastclick");
fastClick.attach(document.body);

/** For the logger module */
init();

export interface AppProps {
  dispatch: Function;
  loaded: ResourceName[];
  logs: Log[];
  user: TaggedUser | undefined;
  bot: BotState;
  consistent: boolean;
  autoSyncEnabled: boolean;
}

function mapStateToProps(props: Everything): AppProps {
  return {
    dispatch: props.dispatch,
    user: maybeFetchUser(props.resources.index),
    bot: props.bot,
    logs: _(selectAllLogs(props.resources.index))
      .map(x => x.body)
      .sortBy("created_at")
      .reverse()
      .value(),
    loaded: props.resources.loaded,
    consistent: !!(props.bot || {}).consistent,
    autoSyncEnabled: !!props.bot.hardware.configuration.auto_sync
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
  componentDidCatch(x: Error, y: React.ErrorInfo) { catchErrors(x, y); }

  get isLoaded() {
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
    const currentPath = window.location.pathname;
    return <div className="app">
      <HotKeys dispatch={this.props.dispatch} />
      <NavBar
        consistent={this.props.consistent}
        user={this.props.user}
        bot={this.props.bot}
        dispatch={this.props.dispatch}
        logs={this.props.logs}
        autoSyncEnabled={this.props.autoSyncEnabled}
      />
      {!syncLoaded && <LoadingPlant />}
      {syncLoaded && this.props.children}
      {!currentPath.startsWith("/app/controls") &&
        !currentPath.startsWith("/app/account") &&
        !currentPath.startsWith("/app/regimens") &&
        <ControlsPopup
          dispatch={this.props.dispatch}
          axisInversion={this.props.bot.axis_inversion} />}
    </div>;
  }
}
