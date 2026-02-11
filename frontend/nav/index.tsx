import React from "react";
import { NavBarProps, NavBarState } from "./interfaces";
import { EStopButton } from "./e_stop_btn";
import { Popover } from "../ui";
import { updatePageInfo } from "../util";
import { validBotLocationData } from "../util/location";
import { NavLinks } from "./nav_links";
import { demoAccountLog, TickerList } from "./ticker_list";
import { MobileMenu } from "./mobile_menu";
import { Position } from "@blueprintjs/core";
import { ErrorBoundary } from "../error_boundary";
import { t } from "../i18next_wrapper";
import { Connectivity } from "../devices/connectivity/connectivity";
import { connectivityData } from "../devices/connectivity/generate_data";
import { DiagnosisSaucer } from "../devices/connectivity/diagnosis";
import { maybeSetTimezone } from "../devices/timezones/guess_timezone";
import { BooleanSetting } from "../session_keys";
import { ReadOnlyIcon } from "../read_only_mode";
import { forceOnline, isBotOnlineFromState } from "../devices/must_be_online";
import { setupProgressString } from "../wizard/data";
import { lastSeenNumber } from "../settings/fbos_settings/last_seen_row";
import { Path } from "../internal_urls";
import {
  botPositionLabel,
} from "../farm_designer/map/layers/farmbot/bot_position_label";
import { jobNameLookup, JobsAndLogs, sortJobs } from "../devices/jobs";
import { round } from "lodash";
import { ControlsPanel } from "../controls/controls";
import { Actions } from "../constants";
import { PopupsState } from "../interfaces";
import { Panel, setPanelOpen, TAB_ICON } from "../farm_designer/panel_header";
import { movementPercentRemaining } from "../farm_designer/move_to";
import { isMobile } from "../screen_size";
import { NavigationContext } from "../routes_helpers";
import {
  showTimeTravelButton, TimeTravelContent, TimeTravelTarget,
} from "../three_d_garden/time_travel";

export class NavBar extends React.Component<NavBarProps, Partial<NavBarState>> {
  state: NavBarState = {
    mobileMenuOpen: false,
    documentTitle: "",
  };

  componentDidMount = () => {
    const { device } = this.props;
    device && maybeSetTimezone(this.props.dispatch, device);
  };

  componentDidUpdate = () => {
    if (this.state.documentTitle != document.title) {
      this.setState({ documentTitle: document.title });
    }
  };

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate = (url: string) => this.context?.(url);

  get isStaff() { return this.props.authAud == "staff"; }

  get logs() {
    return this.props.logs.concat(forceOnline() ? [demoAccountLog()] : []);
  }

  toggleMobileMenu = () =>
    this.setState({ mobileMenuOpen: !this.state.mobileMenuOpen });

  closeMobileMenu = () =>
    this.setState({ mobileMenuOpen: false });

  ReadOnlyStatus = () =>
    <ReadOnlyIcon locked={!!this.props.getConfigValue(
      BooleanSetting.user_interface_read_only_mode)} />;

  togglePopup = (payload: keyof PopupsState) => () =>
    this.props.dispatch({ type: Actions.TOGGLE_POPUP, payload });

  TimeTravel = () => {
    const isOpen = this.props.appState.popups.timeTravel;
    const threeDGarden = !!this.props.getConfigValue(BooleanSetting.three_d_garden);
    const common = {
      device: this.props.device.body,
      threeDGarden,
      designer: this.props.designer,
    };
    if (!showTimeTravelButton(threeDGarden, common.device)) { return; }
    return <div className={"nav-popup-button-wrapper"}>
      <Popover position={Position.BOTTOM_RIGHT}
        isOpen={isOpen}
        enforceFocus={false}
        target={<TimeTravelTarget {...common}
          timeSettings={this.props.timeSettings}
          isOpen={isOpen}
          click={this.togglePopup("timeTravel")} />}
        content={<TimeTravelContent {...common}
          dispatch={this.props.dispatch} />} />
    </div>;
  };

  Coordinates = () => {
    const { hardware } = this.props.bot;
    const isOpen = this.props.appState.popups.controls;
    const current = validBotLocationData(hardware.location_data).position;
    const movementState = this.props.appState.movement;
    const remaining = movementPercentRemaining(current, movementState);
    return <div className={"nav-popup-button-wrapper"}>
      <Popover position={Position.BOTTOM_RIGHT}
        portalClassName={"controls-popover-portal"}
        popoverClassName={"controls-popover"}
        isOpen={isOpen}
        enforceFocus={false}
        target={<button type="button"
          className={`nav-coordinates ${isOpen ? "hover" : ""}`}
          onClick={this.togglePopup("controls")}
          title={t("FarmBot position (X, Y, Z)")}
          aria-expanded={isOpen}>
          <img
            src={TAB_ICON[Panel.Controls]}
            alt={t("controls icon")} />
          <p>
            {botPositionLabel(validBotLocationData(hardware.location_data)
              .position, { rounded: true })}
          </p>
          {remaining && !isNaN(remaining) && hardware.informational_settings.busy
            ? <div className={"movement-progress"}
              style={{ width: `${remaining}%` }} />
            : <></>}
        </button>}
        content={<ControlsPanel
          dispatch={this.props.dispatch}
          appState={this.props.appState}
          bot={this.props.bot}
          getConfigValue={this.props.getConfigValue}
          sourceFwConfig={this.props.sourceFwConfig}
          env={this.props.env}
          firmwareHardware={this.props.apiFirmwareValue}
          logs={this.props.logs}
          feeds={this.props.feeds}
          peripherals={this.props.peripherals}
          sequences={this.props.sequences}
          resources={this.props.resources}
          menuOpen={this.props.menuOpen}
          firmwareSettings={this.props.firmwareConfig || hardware.mcu_params}
        />} />
    </div>;
  };

  EstopButton = () =>
    <div className={"e-stop-btn"}>
      <EStopButton
        bot={this.props.bot}
        forceUnlock={!!this.props.getConfigValue(
          BooleanSetting.disable_emergency_unlock_confirmation)} />
    </div>;

  ConnectionStatus = () => {
    const data = connectivityData({
      bot: this.props.bot,
      device: this.props.device,
      apiFirmwareValue: this.props.apiFirmwareValue,
    });
    const { sync_status } = this.props.bot.hardware.informational_settings;
    const click = this.togglePopup("connectivity");
    const isOpen = this.props.appState.popups.connectivity;
    return <div className={"connection-status-popover nav-popup-button-wrapper"}>
      <ErrorBoundary>
        <Popover position={Position.BOTTOM_RIGHT}
          portalClassName={"connectivity-popover-portal"}
          popoverClassName={"connectivity-popover"}
          isOpen={isOpen}
          enforceFocus={false}
          target={<button type="button"
            className={`connectivity-button ${isOpen ? "hover" : ""}`}
            onClick={click}
            aria-expanded={isOpen}>
            <DiagnosisSaucer {...data.flags}
              className={"nav"}
              syncStatus={sync_status} />
            {!isMobile() && <p>{this.props.device.body.name || t("FarmBot")}</p>}
          </button>}
          content={<ErrorBoundary>
            <Connectivity
              bot={this.props.bot}
              rowData={data.rowData}
              flags={data.flags}
              dispatch={this.props.dispatch}
              device={this.props.device}
              pings={this.props.pings}
              alerts={this.props.alerts}
              apiFirmwareValue={this.props.apiFirmwareValue}
              telemetry={this.props.telemetry}
              metricPanelState={this.props.appState.metricPanelState}
              timeSettings={this.props.timeSettings} />
          </ErrorBoundary>} />
      </ErrorBoundary>
    </div>;
  };

  SetupButton = () => {
    const firmwareHardware = this.props.apiFirmwareValue;
    const { wizardStepResults, device } = this.props;
    if (!device.body.setup_completed_at) {
      return <a className={"setup-button"}
        onClick={() => {
          this.props.dispatch(setPanelOpen(true));
          this.navigate(Path.setup());
        }}>
        {t("Setup")}
        {!isMobile() &&
          `: ${setupProgressString(wizardStepResults, { firmwareHardware })}`}
      </a>;
    }
  };

  JobsButton = () => {
    const sortedJobs = sortJobs(this.props.bot.hardware.jobs).active;
    const jobActive = sortedJobs.length > 0;
    const job = jobActive ? sortedJobs[0] : undefined;
    const isPercent = job?.unit == "percent";
    const percent = isPercent ? round(job.percent, 1) : "";
    const activeText = !isMobile() ? jobNameLookup(job) : "";
    const inactiveText = !isMobile() ? t("Idle") : t("jobs");
    const jobProgress = isPercent ? `${percent}%` : "";
    const isOpen = this.props.appState.popups.jobs;
    return <div className={"nav-popup-button-wrapper"}>
      <Popover position={Position.BOTTOM_RIGHT}
        portalClassName={"jobs-panel-portal"}
        popoverClassName={"jobs-panel"}
        isOpen={isOpen}
        enforceFocus={false}
        target={<button type="button"
          className={`jobs-button ${isOpen ? "hover" : ""}`}
          onClick={this.togglePopup("jobs")}
          aria-expanded={isOpen}>
          <i className={"fa fa-history"} />
          {!isMobile() &&
            <div className={"nav-job-info"}>
              <p className={"title"}>{jobActive ? activeText : inactiveText}</p>
              {jobActive &&
                <p className={"jobs-button-progress-text"}>{jobProgress}</p>}
            </div>}
          {jobActive && <div className={"jobs-button-progress-bar"}
            style={{ width: jobProgress }} />}
        </button>}
        content={<JobsAndLogs
          dispatch={this.props.dispatch}
          bot={this.props.bot}
          getConfigValue={this.props.getConfigValue}
          logs={this.logs}
          sourceFbosConfig={this.props.sourceFbosConfig}
          fbosVersion={this.props.device.body.fbos_version}
          jobs={this.props.bot.hardware.jobs}
          device={this.props.device}
          timeSettings={this.props.timeSettings} />} />
    </div>;
  };

  AppNavLinks = () =>
    <div className={"app-nav-links"}>
      <i className={"fa fa-bars mobile-menu-icon"}
        onClick={this.toggleMobileMenu} />
      <span className="mobile-menu-container">
        <MobileMenu
          designer={this.props.designer}
          dispatch={this.props.dispatch}
          close={this.closeMobileMenu}
          alertCount={this.props.alertCount}
          mobileMenuOpen={this.state.mobileMenuOpen}
          helpState={this.props.helpState} />
      </span>
      <span className="top-menu-container">
        <NavLinks
          designer={this.props.designer}
          dispatch={this.props.dispatch}
          close={this.closeMobileMenu}
          alertCount={this.props.alertCount}
          helpState={this.props.helpState} />
      </span>
    </div>;

  TickerList = () =>
    <TickerList
      dispatch={this.props.dispatch}
      logs={this.logs}
      timeSettings={this.props.timeSettings}
      getConfigValue={this.props.getConfigValue}
      lastSeen={lastSeenNumber({ bot: this.props.bot, device: this.props.device })}
      botOnline={isBotOnlineFromState(this.props.bot)} />;

  render() {
    /** Change document meta title on every route change. */
    updatePageInfo(Path.getSlug(Path.app()), Path.getSlug(Path.designer()));

    return <ErrorBoundary>
      <div className={[
        "nav-wrapper",
        this.isStaff ? "red" : "",
      ].join(" ")}>
        <a href="#main-content" className="skip-nav-link">
          {t("Skip to main content")}
        </a>
        <nav role="navigation">
          <div className="nav-bar grid no-gap">
            <this.TickerList />
            <div className="nav-group">
              <div className="nav-left">
                <this.AppNavLinks />
              </div>
              <div className="nav-right">
                <ErrorBoundary>
                  <this.ReadOnlyStatus />
                  <this.EstopButton />
                  <this.ConnectionStatus />
                  <this.SetupButton />
                  <this.TimeTravel />
                  <this.Coordinates />
                  <this.JobsButton />
                </ErrorBoundary>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </ErrorBoundary>;
  }
}
