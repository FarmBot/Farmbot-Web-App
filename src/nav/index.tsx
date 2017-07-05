import * as React from "react";
import { Link } from "react-router";
import { NavBarState, NavBarProps } from "./interfaces";
import { EStopButton } from "../devices/components/e_stop_btn";
import { t } from "i18next";
import { Session } from "../session";
import { Markdown, Row, Col } from "../ui";
import * as moment from "moment";
import { history } from "../history";
import { updatePageInfo } from "../util";
import { SyncButton } from "./sync_button";
import { NavLinks } from "./links";

export class NavBar extends React.Component<NavBarProps, NavBarState> {

  logout = () => Session.clear(true);

  render() {
    /** The way our app is laid out, we'll pretty much always want this bit. */
    let pageName = history.getCurrentLocation().pathname.split("/")[2] || "";

    /** Change document meta title on every route change. */
    updatePageInfo(pageName);

    return <div className="nav-wrapper">
      <nav role="navigation">
        <Row>
          <Col xs={12}>
            {NavLinks(this.logout)}
            <EStopButton
              bot={this.props.bot}
              user={this.props.user}
            />
            <SyncButton
              bot={this.props.bot}
              user={this.props.user}
              dispatch={this.props.dispatch}
            />
          </Col>
        </Row>
      </nav>
    </div>;
  }
}
