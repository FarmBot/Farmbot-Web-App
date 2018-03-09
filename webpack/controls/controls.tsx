import * as React from "react";
import { connect } from "react-redux";
import { Peripherals } from "./peripherals";
import { Row, Page, Col } from "../ui/index";
import { mapStateToProps } from "./state_to_props";
import { WebcamPanel } from "./webcam";
import { Props, MoveProps } from "./interfaces";
import { Move } from "./move";
import { BooleanSetting } from "../session_keys";
import { Session } from "../session";
import { catchErrors } from "../util";

@connect(mapStateToProps)
export class Controls extends React.Component<Props, {}> {
  componentDidCatch(x: Error, y: React.ErrorInfo) { catchErrors(x, y); }
  render() {
    const arduinoBusy = !!this
      .props
      .bot
      .hardware
      .informational_settings
      .busy;
    const moveProps: MoveProps = {
      bot: this.props.bot,
      user: this.props.user,
      dispatch: this.props.dispatch,
      disabled: arduinoBusy,
      raw_encoders: !!Session.deprecatedGetBool(BooleanSetting.raw_encoders),
      scaled_encoders: !!Session.deprecatedGetBool(BooleanSetting.scaled_encoders),
      x_axis_inverted: !!Session.deprecatedGetBool(BooleanSetting.x_axis_inverted),
      y_axis_inverted: !!Session.deprecatedGetBool(BooleanSetting.y_axis_inverted),
      z_axis_inverted: !!Session.deprecatedGetBool(BooleanSetting.z_axis_inverted),
      botToMqttStatus: this.props.botToMqttStatus
    };
    const showWebcamWidget = !Session.deprecatedGetBool(BooleanSetting.hide_webcam_widget);
    return <Page className="controls">
      {showWebcamWidget
        ?
        <Row>
          <Col xs={12} sm={6} md={5} mdOffset={1}>
            <Move {...moveProps} />
            <Peripherals
              bot={this.props.bot}
              peripherals={this.props.peripherals}
              dispatch={this.props.dispatch}
              disabled={arduinoBusy} />
          </Col>
          <Col xs={12} sm={6}>
            <WebcamPanel feeds={this.props.feeds} dispatch={this.props.dispatch} />
          </Col>
        </Row>
        :
        <Row>
          <Col xs={12} sm={6} md={5} mdOffset={1}>
            <Move {...moveProps} />
          </Col>
          <Col xs={12} sm={5}>
            <Peripherals
              bot={this.props.bot}
              peripherals={this.props.peripherals}
              dispatch={this.props.dispatch}
              disabled={arduinoBusy} />
          </Col>
        </Row>}
    </Page>;
  }
}
