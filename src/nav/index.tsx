import * as React from "react";
import { Link } from "react-router";
import { NavBarState, NavBarProps } from "./interfaces";
import { EStopButton } from "../devices/components/e_stop_btn";
import { t } from "i18next";
import { Session } from "../session";
import { Markdown, Row, Col } from "../ui";
import * as moment from "moment";
import { SyncButton } from "./sync_button";
import { history } from "../history";
import { updatePageInfo } from "../util";

export class NavBar extends React.Component<NavBarProps, NavBarState> {

  logout = () => Session.clear(true);

  render() {
    // The way our app is laid out, we'll pretty much always want this bit.
    let pageName = history.getCurrentLocation().pathname.split("/")[2] || "";

    // Change document meta title on every route change.
    updatePageInfo(pageName);

    return <div className="nav-wrapper">
      <Row>
        <Col xs={12}>
          <nav role="navigation">
            <span className="page-name visible-xs-inline-block">
              {pageName}
            </span>
            <SyncButton
              bot={this.props.bot}
              user={this.props.user}
              dispatch={this.props.dispatch}
            />
            <EStopButton
              bot={this.props.bot}
              user={this.props.user}
            />
          </nav>
        </Col>
      </Row>
    </div>;
  }
}
