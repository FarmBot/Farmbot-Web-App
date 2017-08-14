import * as React from "react";
import { connect } from "react-redux";
import { Peripherals } from "./peripherals";
import { Row, Page, Col } from "../ui";
import { mapStateToProps } from "./state_to_props";
import { WebcamPanel } from "./webcam_panel";
import { Props } from "./interfaces";
import { Move } from "./move";

@connect(mapStateToProps)
export class Controls extends React.Component<Props, {}> {
  render() {
    let arduinoBusy = !!this
      .props
      .bot
      .hardware
      .informational_settings
      .busy;
    return (
      <Page className="controls">
        <Row>
          <Col xs={12} sm={6} md={5} mdOffset={1}>
            <Move bot={this.props.bot}
              user={this.props.user}
              dispatch={this.props.dispatch}
              disabled={arduinoBusy} />
            <Peripherals
              bot={this.props.bot}
              peripherals={this.props.peripherals}
              dispatch={this.props.dispatch}
              resources={this.props.resources}
              disabled={arduinoBusy}
            />
          </Col>
          <Col xs={12} sm={6}>
            <WebcamPanel bot={this.props.bot}
              account={this.props.account}
              dispatch={this.props.dispatch} />
          </Col>
        </Row>
      </Page>
    );
  }
}
