import React from "react";
import { NavBarProps, NavBarState } from "./interfaces";
import { EStopButton } from "./e_stop_btn";
import { Session } from "../session";
import { Row, Col } from "../ui";
import { getPathArray, push } from "../history";
import { updatePageInfo } from "../util";
import { SyncButton } from "./sync_button";
import { NavLinks } from "./nav_links";
import { TickerList } from "./ticker_list";
import { AdditionalMenu } from "./additional_menu";
import { MobileMenu } from "./mobile_menu";
import { Popover, Position } from "@blueprintjs/core";
import { ErrorBoundary } from "../error_boundary";
import { RunTour } from "../help/tour";
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
  }

  componentDidUpdate = () => {
    if (this.state.documentTitle != document.title) {
      this.props.dispatch(refresh(this.props.device));
      this.setState({ documentTitle: document.title });
    }
  }

  logout = () => Session.clear();

  toggle = (key: keyof NavBarState) => () =>
    this.setState({ [key]: !this.state[key] });

  close = (key: keyof NavBarState) => () =>
    this.setState({ [key]: false });

  ReadOnlyStatus = () =>
    <ReadOnlyIcon locked={!!this.props.getConfigValue(
      BooleanSetting.user_interface_read_only_mode)} />

  SyncButton = () =>
    <SyncButton
      bot={this.props.bot}
      dispatch={this.props.dispatch}
      consistent={this.props.consistent} />

  EstopButton = () =>
    <EStopButton
      bot={this.props.bot}
      forceUnlock={!!this.props.getConfigValue(
        BooleanSetting.disable_emergency_unlock_confirmation)} />

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
        onClose={this.close("accountMenuOpen")}>
        <div className="nav-name" data-title={firstName}
          onClick={this.toggle("accountMenuOpen")}>
          {firstName}
        </div>
        <AdditionalMenu logout={this.logout} close={this.close} />
      </Popover>
    </div>;
  }

  ConnectionStatus = () => {
    const data = connectivityData({
      bot: this.props.bot,
      device: this.props.device,
      apiFirmwareValue: this.props.apiFirmwareValue,
    });
    return <div className="connection-status-popover">
      <ErrorBoundary>
        <Popover position={Position.BOTTOM_RIGHT}
          portalClassName={"connectivity-popover-portal"}
          popoverClassName="connectivity-popover">
          {window.innerWidth <= 450
            ? <DiagnosisSaucer {...data.flags} className={"nav"} />
            : <div className={"connectivity-button"}>
              <p>{t("Connectivity")}</p>
              <DiagnosisSaucer {...data.flags} className={"nav"} />
            </div>}
          <ErrorBoundary>
            <Connectivity
              bot={this.props.bot}
              rowData={data.rowData}
              flags={data.flags}
              dispatch={this.props.dispatch}
              device={this.props.device}
              pings={this.props.pings}
              alerts={this.props.alerts}
              apiFirmwareValue={this.props.apiFirmwareValue}
              timeSettings={this.props.timeSettings} />
          </ErrorBoundary>
        </Popover>
      </ErrorBoundary>
    </div>;
  }

  SetupButton = () => {
    const firmwareHardware = this.props.apiFirmwareValue;
    const { wizardStepResults, device } = this.props;
    return !device.body.setup_completed_at
      ? <a className={"setup-button"}
        onClick={() => push("/app/designer/setup")}>
        {t("Setup")}
        {window.innerWidth > 450 &&
          `: ${setupProgressString(wizardStepResults, firmwareHardware)}`}
      </a>
      : <div />;
  };

  AppNavLinks = () =>
    <div className={"app-nav-links"}>
      <i className={"fa fa-bars mobile-menu-icon"}
        onClick={this.toggle("mobileMenuOpen")} />
      <span className="mobile-menu-container">
        <MobileMenu close={this.close} alertCount={this.props.alertCount}
          mobileMenuOpen={this.state.mobileMenuOpen} />
      </span>
      <span className="top-menu-container">
        <NavLinks close={this.close} alertCount={this.props.alertCount} />
      </span>
    </div>;

  TickerList = () =>
    <TickerList
      logs={this.props.logs}
      tickerListOpen={this.state.tickerListOpen}
      toggle={this.toggle}
      timeSettings={this.props.timeSettings}
      getConfigValue={this.props.getConfigValue}
      botOnline={isBotOnlineFromState(this.props.bot)} />

  render() {
    /** Change document meta title on every route change. */
    updatePageInfo(getPathArray()[2] || "", getPathArray()[3]);

    return <ErrorBoundary>
      <div className={[
        "nav-wrapper",
        this.props.authAud == "staff" ? "red" : "",
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
                      <this.SyncButton />
                      <this.ConnectionStatus />
                      <this.SetupButton />
                      <RunTour currentTour={this.props.tour} />
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
