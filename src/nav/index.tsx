import * as React from "react";
import { Link } from "react-router";
import { t } from "i18next";
import * as moment from "moment";
import { NavBarProps, NavBarState } from "./interfaces";
import { EStopButton } from "../devices/components/e_stop_btn";
import { Session } from "../session";
import { Markdown, Row, Col } from "../ui";
import { history } from "../history";
import { updatePageInfo } from "../util";
import { SyncButton } from "./sync_button";
import { NavLinks } from "./links";
import { TickerList } from "./ticker_list";
import { AdditionalMenu } from "./additional_menu";
import { MobileMenu } from "./mobile_menu";
import {
  Popover,
  Position,
  Tooltip,
  PopoverInteractionKind
} from "@blueprintjs/core/dist";

export class NavBar extends React.Component<NavBarProps, Partial<NavBarState>> {

  state: NavBarState = {
    mobileMenuOpen: false,
    tickerListOpen: false
  };

  logout = () => Session.clear(true);

  toggle = (name: keyof NavBarState) => () =>
    this.setState({ [name]: !this.state[name] });

  render() {
    let hasName = this.props.user && this.props.user.body.name;
    let firstName = hasName ? `${hasName.split(" ")[0]} ▾` : `${t("Menu")} ▾`;
    let menuIconClassNames: string[] = [
      "fa", "fa-bars", "visible-xs-inline-block", "mobile-menu-icon"
    ];

    /** The way our app is laid out, we'll pretty much always want this bit. */
    let pageName = history.getCurrentLocation().pathname.split("/")[2] || "";

    /** Change document meta title on every route change. */
    updatePageInfo(pageName);

    let { toggle } = this;
    let { mobileMenuOpen, tickerListOpen } = this.state;
    let { logs } = this.props;

    return <div className="nav-wrapper">
      <nav role="navigation">
        <Row>
          <Col xs={12}>
            <div>
              {TickerList({ logs, tickerListOpen, toggle })}
              <div className="nav-group">
                <div className="nav-left">
                  <i
                    className={menuIconClassNames.join(" ")}
                    onClick={this.toggle("mobileMenuOpen")}
                  />
                  {MobileMenu({ toggle, mobileMenuOpen })}
                  {NavLinks()}
                </div>
                <div className="nav-right">
                  <Popover
                    inline
                    interactionKind={PopoverInteractionKind.HOVER}
                    target={<div className="nav-name">{firstName}</div>}
                    position={Position.BOTTOM_RIGHT}
                    content={AdditionalMenu(this.logout)}
                  />
                  <EStopButton
                    bot={this.props.bot}
                    user={this.props.user}
                  />
                  <SyncButton
                    bot={this.props.bot}
                    user={this.props.user}
                    dispatch={this.props.dispatch}
                  />
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </nav>
    </div>;
  }
}
