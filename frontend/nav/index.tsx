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

  toggle = (name: keyof NavBarState) => () =>
    this.setState({ [name]: !this.state[name] });

  close = (name: keyof NavBarState) => () =>
    this.setState({ [name]: false });

  syncButton = () => {
    return <SyncButton
      bot={this.props.bot}
      dispatch={this.props.dispatch}
      autoSync={this.props.autoSync}
      consistent={this.props.consistent} />;
  }

  get connectivityData() {
    return connectivityData({
      bot: this.props.bot,
      device: this.props.device
    });
  }

  render() {
    const isLocked = this.props.getConfigValue("user_interface_read_only_mode");
    const hasName = this.props.user && this.props.user.body.name;

    const firstName = hasName ?
      `${hasName.split(" ")[0].slice(0, 9)} ▾` : `${t("Menu")} ▾`;

    const menuIconClassNames: string[] = [
      "fa", "fa-bars", "mobile-menu-icon"
    ];

    /** The way our app is laid out, we'll pretty much always want this bit. */
    const pageName = getPathArray()[2] || "";

    /** Change document meta title on every route change. */
    updatePageInfo(pageName);

    const { toggle, close } = this;
    const { mobileMenuOpen, tickerListOpen, accountMenuOpen } = this.state;
    const { logs, timeSettings, getConfigValue, alertCount } = this.props;
    const tickerListProps = {
      logs, tickerListOpen, toggle, timeSettings, getConfigValue
    };
    return <ErrorBoundary>
      <div className="nav-wrapper">
        <nav role="navigation">
          <Row>
            <Col xs={12}>
              <div>
                <TickerList {...tickerListProps} />
                <div className="nav-group">
                  <div className="nav-left">
                    <i
                      className={menuIconClassNames.join(" ")}
                      onClick={this.toggle("mobileMenuOpen")} />
                    <span className="mobile-menu-container">
                      {MobileMenu({ close, mobileMenuOpen, alertCount })}
                    </span>
                    <span className="top-menu-container">
                      {NavLinks({ close, alertCount })}
                    </span>
                    <ReadOnlyIcon locked={!!isLocked} />
                  </div>
                  <div className="nav-right">
                    <div className="menu-popover">
                      <Popover
                        portalClassName={"nav-right"}
                        popoverClassName={"menu-popover"}
                        position={Position.BOTTOM_RIGHT}
                        isOpen={accountMenuOpen}
                        onClose={this.close("accountMenuOpen")}>
                        <div className="nav-name"
                          onClick={this.toggle("accountMenuOpen")}>
                          {firstName}
                        </div>
                        {AdditionalMenu({ logout: this.logout, close })}
                      </Popover>
                    </div>
                    <EStopButton
                      bot={this.props.bot}
                      forceUnlock={!!this.props.getConfigValue(
                        BooleanSetting.disable_emergency_unlock_confirmation)} />
                    {this.syncButton()}
                    <div className="connection-status-popover">
                      <Popover position={Position.BOTTOM_RIGHT}
                        portalClassName={"connectivity-popover-portal"}
                        popoverClassName="connectivity-popover">
                        <DiagnosisSaucer {...this.connectivityData.flags} />
                        <Connectivity
                          bot={this.props.bot}
                          rowData={this.connectivityData.rowData}
                          flags={this.connectivityData.flags} />
                      </Popover>
                    </div>
                    <RunTour currentTour={this.props.tour} />
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
