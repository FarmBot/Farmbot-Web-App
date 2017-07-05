import * as React from "react";
import { Link } from "react-router";
import { t } from "i18next";
import * as moment from "moment";
import { NavBarState, NavBarProps } from "./interfaces";
import { EStopButton } from "../devices/components/e_stop_btn";
import { Session } from "../session";
import { Markdown, Row, Col } from "../ui";
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
            <div className="nav-group">
              <div className="nav-left">
                {NavLinks(this.logout)}
              </div>
              <div className="nav-right">
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
          </Col>
        </Row>
      </nav>
    </div>;
  }
}
