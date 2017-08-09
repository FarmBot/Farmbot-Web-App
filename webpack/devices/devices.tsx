import * as React from "react";
import { connect } from "react-redux";
import { HardwareSettings } from "./components/hardware_settings";
import { FarmbotOsSettings } from "./components/farmbot_os_settings";
import { Page, Col, Row } from "../ui";
import { mapStateToProps } from "./state_to_props";
import { Props } from "./interfaces";

@connect(mapStateToProps)
export class Devices extends React.Component<Props, {}> {
  render() {
    if (this.props.auth) {
      return <Page className="devices">
        <Row>
          <Col xs={12} sm={6}>
            <FarmbotOsSettings
              account={this.props.deviceAccount}
              dispatch={this.props.dispatch}
              bot={this.props.bot}
              auth={this.props.auth}
            />
          </Col>
          <Col xs={12} sm={6}>
            <HardwareSettings
              controlPanelState={this.props.bot.controlPanelState}
              dispatch={this.props.dispatch}
              bot={this.props.bot}
            />
          </Col>
        </Row>
      </Page>;
    } else {
      throw new Error("Log in first");
    }
  }
}
