import * as React from "react";
import { NavBarProps, NavBarState } from "./interfaces";
import { EStopButton } from "../devices/components/e_stop_btn";
import { Session } from "../session";
import { Row, Col } from "../ui/index";
import { getPathArray } from "../history";
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

export class NavBar extends React.Component<NavBarProps, Partial<NavBarState>> {
  state: NavBarState = {
    mobileMenuOpen: false,
    tickerListOpen: false,
    accountMenuOpen: false
  };

  componentDidMount = () => {
    const { device } = this.props;
    device && maybeSetTimezone(this.props.dispatch, device);
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
      autoSync={this.props.autoSync}
      consistent={this.props.consistent} />

  EstopButton = () =>
    <EStopButton
      bot={this.props.bot}
      forceUnlock={!!this.props.getConfigValue(
        BooleanSetting.disable_emergency_unlock_confirmation)} />

  AccountMenu = () => {
    const hasName = this.props.user?.body.name;
    const firstName = hasName ?
      `${hasName.split(" ")[0].slice(0, 9)} ▾` : `${t("Menu")} ▾`;
    return <div className="menu-popover">
      <Popover
        portalClassName={"nav-right"}
        popoverClassName={"menu-popover"}
        position={Position.BOTTOM_RIGHT}
        isOpen={this.state.accountMenuOpen}
        onClose={this.close("accountMenuOpen")}>
        <div className="nav-name" data-title={firstName}
          onClick={this.toggle("accountMenuOpen")}>
          {firstName}
        </div>
        {AdditionalMenu({ logout: this.logout, close: this.close })}
      </Popover>
    </div>;
  }

  ConnectionStatus = () => {
    const data = connectivityData({
      bot: this.props.bot,
      device: this.props.device
    });
    return <div className="connection-status-popover">
      <Popover position={Position.BOTTOM_RIGHT}
        portalClassName={"connectivity-popover-portal"}
        popoverClassName="connectivity-popover">
        <DiagnosisSaucer {...data.flags} />
        <ErrorBoundary>
          <Connectivity
            bot={this.props.bot}
            rowData={data.rowData}
            flags={data.flags}
            pings={this.props.pings} />
        </ErrorBoundary>
      </Popover>
    </div>;
  }

  AppNavLinks = () => {
    const { close } = this;
    const { mobileMenuOpen } = this.state;
    const { alertCount } = this.props;
    return <div className={"app-nav-links"}>
      <i className={"fa fa-bars mobile-menu-icon"}
        onClick={this.toggle("mobileMenuOpen")} />
      <span className="mobile-menu-container">
        {MobileMenu({ close, mobileMenuOpen, alertCount })}
      </span>
      <span className="top-menu-container">
        {NavLinks({ close, alertCount })}
      </span>
    </div>;
  }

  render() {
    /** Change document meta title on every route change. */
    updatePageInfo(getPathArray()[2] || "");

    const { toggle } = this;
    const { tickerListOpen } = this.state;
    const { logs, timeSettings, getConfigValue } = this.props;
    const tickerListProps = {
      logs, tickerListOpen, toggle, timeSettings, getConfigValue
    };
    return <ErrorBoundary>
      <div className="nav-wrapper">
        <nav role="navigation">
          <Row>
            <Col xs={12}>
              <div className={"nav-bar"}>
                <TickerList {...tickerListProps} />
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
