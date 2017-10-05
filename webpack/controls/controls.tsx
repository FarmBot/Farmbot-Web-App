import * as React from "react";
import { connect } from "react-redux";
import { Peripherals } from "./peripherals";
import { Row, Page, Col } from "../ui";
import { mapStateToProps } from "./state_to_props";
import { WebcamPanel } from "./webcam";
import { Props } from "./interfaces";
import { Move } from "./move";
import { BooleanSetting } from "../session_keys";
import { Session } from "../session";

@connect(mapStateToProps)
export class Controls extends React.Component<Props, {}> {
  render() {
    const arduinoBusy = !!this
      .props
      .bot
      .hardware
      .informational_settings
      .busy;
    const showWebcamWidget = !Session.getBool(BooleanSetting.hideWebcamWidget);
    return <Page className="controls">
      {showWebcamWidget
        ?
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
              disabled={arduinoBusy} />
          </Col>
          <Col xs={12} sm={6}>
            <WebcamPanel feeds={this.props.feeds} dispatch={this.props.dispatch} />
          </Col>
        </Row>
        :
        <Row>
          <Col xs={12} sm={6} md={5} mdOffset={1}>
            <Move bot={this.props.bot}
              user={this.props.user}
              dispatch={this.props.dispatch}
              disabled={arduinoBusy} />
          </Col>
          <Col xs={12} sm={5}>
            <Peripherals
              bot={this.props.bot}
              peripherals={this.props.peripherals}
              dispatch={this.props.dispatch}
              resources={this.props.resources}
              disabled={arduinoBusy} />
          </Col>
        </Row>}
    </Page>;
  }
}
