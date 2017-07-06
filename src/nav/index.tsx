import * as React from "react";
import { Link } from "react-router";
import { t } from "i18next";
import * as moment from "moment";
import { NavBarProps } from "./interfaces";
import { EStopButton } from "../devices/components/e_stop_btn";
import { Session } from "../session";
import { Markdown, Row, Col } from "../ui";
import { history } from "../history";
import { updatePageInfo } from "../util";
import { SyncButton } from "./sync_button";
import { NavLinks } from "./links";
import { AdditionalMenu } from "./additional_menu";
import {
  Popover,
  Position,
  Tooltip,
  PopoverInteractionKind
} from "@blueprintjs/core/dist";

export class NavBar extends React.Component<NavBarProps, {}> {

  logout = () => Session.clear(true);

  render() {
    let hasName = this.props.user && this.props.user.body.name;
    let firstName = hasName ? `${hasName.split(" ")[0]} ▾` : `${t("Menu")} ▾`;

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
          </Col>
        </Row>
      </nav>
    </div>;
  }
}
