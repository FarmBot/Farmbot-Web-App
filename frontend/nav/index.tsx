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
import { jobNameLookup, JobsTable, sortJobs } from "../devices/jobs";
import { round } from "lodash";

export class NavBar extends React.Component<NavBarProps, Partial<NavBarState>> {
  state: NavBarState = {
    mobileMenuOpen: false,
    tickerListOpen: false,
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

  Coordinates = () =>
    <p className={"nav-coordinates"} title={t("FarmBot position (X, Y, Z)")}>
      {botPositionLabel(validBotLocationData(this.props.bot.hardware.location_data)
        .position)}
    </p>;

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
        target={<div className="nav-name" data-title={firstName}
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
    return <div className="connection-status-popover">
      <ErrorBoundary>
        <Popover position={Position.BOTTOM_RIGHT}
          portalClassName={"connectivity-popover-portal"}
          popoverClassName="connectivity-popover"
          target={window.innerWidth <= 450
            ? <DiagnosisSaucer {...data.flags}
              syncStatus={sync_status}
              className={"nav connectivity-icon"} />
            : <div className={"connectivity-button"}>
              <p>{t("Connectivity")}</p>
              <DiagnosisSaucer {...data.flags} className={"nav"}
                syncStatus={sync_status} />
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
              metricPanelState={this.props.metricPanelState}
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
        {window.innerWidth > 450 &&
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
    const activeText = window.innerWidth > 450 ? jobNameLookup(job) : "";
    const inactiveText = window.innerWidth > 450 ? t("no active jobs") : t("jobs");
    const jobProgress = isPercent ? `${percent}%` : "";
    return <Popover position={Position.BOTTOM_RIGHT}
      portalClassName={"jobs-panel-portal"}
      popoverClassName={"jobs-panel"}
      target={<a className={"jobs-button"}>
        <p className={"title"}>{jobActive ? activeText : inactiveText}</p>
        {jobActive && <p className={"jobs-button-progress-text"}>{jobProgress}</p>}
        {jobActive && <div className={"jobs-button-progress-bar"}
          style={{ width: jobProgress }} />}
      </a>}
      content={<JobsTable jobs={this.props.bot.hardware.jobs}
        timeSettings={this.props.timeSettings} />} />;
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
      logs={this.props.logs}
      tickerListOpen={this.state.tickerListOpen}
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
