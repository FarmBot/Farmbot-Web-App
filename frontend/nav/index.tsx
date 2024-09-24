import React from "react";
import { NavBarProps, NavBarState } from "./interfaces";
import { EStopButton } from "./e_stop_btn";
import { Row, Col, Popover } from "../ui";
import { push } from "../history";
import { updatePageInfo } from "../util";
import { validBotLocationData } from "../util/location";
import { NavLinks } from "./nav_links";
import { TickerList } from "./ticker_list";
import { AdditionalMenu } from "./additional_menu";
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
import { refresh } from "../api/crud";
import { isBotOnlineFromState } from "../devices/must_be_online";
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
import { Panel, TAB_ICON } from "../farm_designer/panel_header";
import { movementPercentRemaining } from "../farm_designer/move_to";
import { isMobile } from "../screen_size";

export class NavBar extends React.Component<NavBarProps, Partial<NavBarState>> {
  state: NavBarState = {
    mobileMenuOpen: false,
    accountMenuOpen: false,
    documentTitle: "",
  };

  componentDidMount = () => {
    const { device } = this.props;
    device && maybeSetTimezone(this.props.dispatch, device);
  };

  componentDidUpdate = () => {
    if (this.state.documentTitle != document.title) {
      this.props.dispatch(refresh(this.props.device));
      this.setState({ documentTitle: document.title });
    }
  };

  get isStaff() { return this.props.authAud == "staff"; }

  toggle = (key: keyof NavBarState) => () =>
    this.setState({ [key]: !this.state[key] });

  close = (key: keyof NavBarState) => () =>
    this.setState({ [key]: false });

  ReadOnlyStatus = () =>
    <ReadOnlyIcon locked={!!this.props.getConfigValue(
      BooleanSetting.user_interface_read_only_mode)} />;

  togglePopup = (payload: keyof PopupsState) => () =>
    this.props.dispatch({ type: Actions.TOGGLE_POPUP, payload });

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
        target={<div className={`nav-coordinates ${isOpen ? "hover" : ""}`}
          onClick={this.togglePopup("controls")}
          title={t("FarmBot position (X, Y, Z)")}>
          <img
            src={TAB_ICON[Panel.Controls]} />
          <p>
            {botPositionLabel(validBotLocationData(hardware.location_data)
              .position, { rounded: true })}
          </p>
          {remaining && !isNaN(remaining) && hardware.informational_settings.busy
            ? <div className={"movement-progress"}
              style={{ width: `${remaining}%` }} />
            : <></>}
        </div>}
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

  AccountMenu = () => {
    const hasName = this.props.user?.body.name;
    const firstName = hasName
      ? `${hasName.split(" ")[0].slice(0, 9)} ▾`
      : `${t("Menu")} ▾`;
    return <div className="menu-popover">
      <Popover
        popoverClassName={"menu-popover"}
        position={Position.BOTTOM_RIGHT}
        isOpen={this.state.accountMenuOpen}
        onClose={this.close("accountMenuOpen")}
        target={isMobile()
          ? <i className={"fa fa-user"} onClick={this.toggle("accountMenuOpen")} />
          : <div className="nav-name" data-title={firstName}
            onClick={this.toggle("accountMenuOpen")}>
            {firstName}
          </div>}
        content={<AdditionalMenu close={this.close} isStaff={this.isStaff} />} />
    </div>;
  };

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
          target={<div className={`connectivity-button ${isOpen ? "hover" : ""}`}
            onClick={click}>
            <DiagnosisSaucer {...data.flags}
              className={"nav"}
              syncStatus={sync_status} />
            {!isMobile() && <p>{t("Connectivity")}</p>}
          </div>}
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
    return !device.body.setup_completed_at
      ? <a className={"setup-button"}
        onClick={() => push(Path.setup())}>
        {t("Setup")}
        {!isMobile() &&
          `: ${setupProgressString(wizardStepResults, { firmwareHardware })}`}
      </a>
      : <div style={{ display: "inline" }} />;
  };

  JobsButton = () => {
    const sortedJobs = sortJobs(this.props.bot.hardware.jobs).active;
    const jobActive = sortedJobs.length > 0;
    const job = jobActive ? sortedJobs[0] : undefined;
    const isPercent = job?.unit == "percent";
    const percent = isPercent ? round(job.percent, 1) : "";
    const activeText = !isMobile() ? jobNameLookup(job) : "";
    const inactiveText = !isMobile() ? t("idle") : t("jobs");
    const jobProgress = isPercent ? `${percent}%` : "";
    const isOpen = this.props.appState.popups.jobs;
    return <div className={"nav-popup-button-wrapper"}>
      <Popover position={Position.BOTTOM_RIGHT}
        portalClassName={"jobs-panel-portal"}
        popoverClassName={"jobs-panel"}
        isOpen={isOpen}
        enforceFocus={false}
        target={<a className={`jobs-button ${isOpen ? "hover" : ""}`}
          onClick={this.togglePopup("jobs")}>
          <i className={"fa fa-history"} />
          {!isMobile() &&
            <div className={"nav-job-info"}>
              <p className={"title"}>{jobActive ? activeText : inactiveText}</p>
              {jobActive &&
                <p className={"jobs-button-progress-text"}>{jobProgress}</p>}
            </div>}
          {jobActive && <div className={"jobs-button-progress-bar"}
            style={{ width: jobProgress }} />}
        </a>}
        content={<JobsAndLogs
          dispatch={this.props.dispatch}
          bot={this.props.bot}
          getConfigValue={this.props.getConfigValue}
          logs={this.props.logs}
          jobsPanelState={this.props.appState.jobs}
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
        onClick={this.toggle("mobileMenuOpen")} />
      <span className="mobile-menu-container">
        <MobileMenu close={this.close} alertCount={this.props.alertCount}
          mobileMenuOpen={this.state.mobileMenuOpen}
          helpState={this.props.helpState} />
      </span>
      <span className="top-menu-container">
        <NavLinks close={this.close} alertCount={this.props.alertCount}
          helpState={this.props.helpState} />
      </span>
    </div>;

  TickerList = () =>
    <TickerList
      dispatch={this.props.dispatch}
      logs={this.props.logs}
      toggle={this.toggle}
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
        <nav role="navigation">
          <Row>
            <Col xs={12}>
              <div className="nav-bar">
                <this.TickerList />
                <div className="nav-group">
                  <div className="nav-left">
                    <this.AppNavLinks />
                  </div>
                  <div className="nav-right">
                    <ErrorBoundary>
                      <this.ReadOnlyStatus />
                      <this.AccountMenu />
                      <this.EstopButton />
                      <this.ConnectionStatus />
                      <this.SetupButton />
                      <this.JobsButton />
                      <this.Coordinates />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </nav>
      </div>
    </ErrorBoundary>;
  }
}
