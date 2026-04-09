import React from "react";
import { connect, ConnectedComponent } from "react-redux";
import { error, warning } from "./toast/toast";
import { NavBar } from "./nav";
import { Everything } from "./interfaces";
import { LoadingPlant } from "./loading_plant";
import {
  FirmwareHardware,
  ResourceName, Xyz,
} from "farmbot";
import { HotKeys } from "./hotkeys";
import { Content } from "./constants";
import { BooleanSetting, StringSetting } from "./session_keys";
import {
  getWebAppConfigValue, GetWebAppConfigValue,
} from "./config_storage/actions";
import { intersection, isString } from "lodash";
import { t } from "./i18next_wrapper";
import {
  getFwHardwareValue,
} from "./settings/firmware/firmware_hardware_support";
import { getFbosConfig } from "./resources/getters";
import { HelpState } from "./help/reducer";
import { TourStepContainer } from "./help/tours";
import { Toasts } from "./toast/fb_toast";
import Bowser from "bowser";
import { landingPagePath, Path } from "./internal_urls";
import { AppState } from "./reducer";
import { Navigate, Outlet } from "react-router";
import { ErrorBoundary } from "./error_boundary";
import { DesignerState } from "./farm_designer/interfaces";

export interface AppProps {
  dispatch: Function;
  loaded: ResourceName[];
  axisInversion: Record<Xyz, boolean>;
  xySwap: boolean;
  animate: boolean;
  getConfigValue: GetWebAppConfigValue;
  helpState: HelpState;
  apiFirmwareValue: FirmwareHardware | undefined;
  appState: AppState;
  designer: DesignerState;
  children?: React.ReactNode;
}

export function mapStateToProps(props: Everything): AppProps {
  const webAppConfigValue = getWebAppConfigValue(() => props);
  return {
    dispatch: props.dispatch,
    loaded: props.resources.loaded,
    axisInversion: {
      x: !!webAppConfigValue(BooleanSetting.x_axis_inverted),
      y: !!webAppConfigValue(BooleanSetting.y_axis_inverted),
      z: !!webAppConfigValue(BooleanSetting.z_axis_inverted),
    },
    xySwap: !!webAppConfigValue(BooleanSetting.xy_swap),
    animate: !webAppConfigValue(BooleanSetting.disable_animations),
    getConfigValue: webAppConfigValue,
    helpState: props.resources.consumers.help,
    apiFirmwareValue: getFwHardwareValue(getFbosConfig(props.resources.index)),
    appState: props.app,
    designer: props.resources.consumers.farm_designer,
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
  private _isMounted = false;
  private get isLoaded() {
    return (MUST_LOAD.length ===
      intersection(this.props.loaded, MUST_LOAD).length);
  }

  /**
 * If the sync object takes more than 10s to load, the user will be granted
 * access into the app, but still warned.
 */
  componentDidMount() {
    this._isMounted = true;
    setTimeout(() => {
      if (this._isMounted && !this.isLoaded) {
        error(t(Content.APP_LOAD_TIMEOUT_MESSAGE), { title: t("Warning") });
      }
    }, LOAD_TIME_FAILURE_MS);
    const browser = Bowser.getParser(window.navigator.userAgent);
    !browser.satisfies({ chrome: ">85", firefox: ">75", edge: ">85" }) &&
      warning(t(Content.UNSUPPORTED_BROWSER));
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const syncLoaded = this.isLoaded;
    const { dispatch, getConfigValue } = this.props;
    const landingPage = getConfigValue(StringSetting.landing_page);
    const themeClass = getConfigValue(BooleanSetting.dark_mode) ? "dark" : "light";
    return <div className={["app", themeClass].join(" ")}>
      {(Path.equals("") || Path.equals(Path.app())) && isString(landingPage) &&
        <Navigate to={landingPagePath(landingPage)} />}
      {!syncLoaded && <LoadingPlant animate={this.props.animate} />}
      <HotKeys dispatch={dispatch} designer={this.props.designer} />
      {syncLoaded && <NavBar />}
      <main id="main-content" tabIndex={-1}>
        {syncLoaded && this.props.children}
        <ErrorBoundary>
          <React.Suspense>
            {syncLoaded && <Outlet />}
          </React.Suspense>
        </ErrorBoundary>
      </main>
      <div className={"toast-container"}>
        <TourStepContainer
          key={JSON.stringify(this.props.helpState)}
          dispatch={dispatch}
          firmwareHardware={this.props.apiFirmwareValue}
          helpState={this.props.helpState} />
        <Toasts
          toastMessages={this.props.appState.toasts}
          dispatch={dispatch} />
      </div>
    </div>;
  }
}

export const App = connect(mapStateToProps)(
  RawApp) as ConnectedComponent<typeof RawApp, { children?: React.ReactNode }>;
export default App;
