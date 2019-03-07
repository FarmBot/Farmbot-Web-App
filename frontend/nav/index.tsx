import * as React from "react";
import { t } from "i18next";
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

export class NavBar extends React.Component<NavBarProps, Partial<NavBarState>> {

  state: NavBarState = {
    mobileMenuOpen: false,
    tickerListOpen: false,
    accountMenuOpen: false
  };

  logout = () => Session.clear();

  toggle = (name: keyof NavBarState) => () =>
    this.setState({ [name]: !this.state[name] });

  close = (name: keyof NavBarState) => () =>
    this.setState({ [name]: false });

  syncButton = () => {
    return <SyncButton
      bot={this.props.bot}
      dispatch={this.props.dispatch}
      consistent={this.props.consistent} />;
  }
  render() {
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
    const { logs, timeOffset, getConfigValue } = this.props;
    const tickerListProps = {
      logs, tickerListOpen, toggle, timeOffset, getConfigValue
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
                      {MobileMenu({ close, mobileMenuOpen })}
                    </span>
                    <span className="top-menu-container">
                      {NavLinks({ close })}
                    </span>
                  </div>
                  <div className="nav-right">
                    <Popover
                      position={Position.BOTTOM_RIGHT}
                      isOpen={accountMenuOpen}
                      onClose={this.close("accountMenuOpen")}
                      usePortal={false}>
                      <div className="nav-name"
                        onClick={this.toggle("accountMenuOpen")}>
                        {firstName}
                      </div>
                      {AdditionalMenu({ logout: this.logout, close })}
                    </Popover>
                    <EStopButton bot={this.props.bot} />
                    {this.syncButton()}
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
