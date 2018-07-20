import * as React from "react";
import { connect } from "react-redux";
import { Peripherals } from "./peripherals";
import { Sensors } from "./sensors";
import { Row, Page, Col } from "../ui/index";
import { mapStateToProps } from "./state_to_props";
import { WebcamPanel } from "./webcam";
import { Props, MoveProps } from "./interfaces";
import { Move } from "./move";
import { BooleanSetting } from "../session_keys";
import { Feature } from "../devices/interfaces";
import { SensorReadings } from "./sensor_readings/sensor_readings";

@connect(mapStateToProps)
export class Controls extends React.Component<Props, {}> {
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
      arduinoBusy,
      botToMqttStatus: this.props.botToMqttStatus,
      firmwareSettings: this.props.firmwareSettings,
      getWebAppConfigVal: this.props.getWebAppConfigVal,
    };
    const showWebcamWidget = !this.props.getWebAppConfigVal(BooleanSetting.hide_webcam_widget);
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
            {this.props.shouldDisplay(Feature.sensors) &&
              <Sensors
                bot={this.props.bot}
                sensors={this.props.sensors}
                dispatch={this.props.dispatch}
                disabled={arduinoBusy} />}
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
            {this.props.shouldDisplay(Feature.sensors) &&
              <Sensors
                bot={this.props.bot}
                sensors={this.props.sensors}
                dispatch={this.props.dispatch}
                disabled={arduinoBusy} />}
            {this.props.sensorReadings.length > 0 &&
              <SensorReadings
                sensorReadings={this.props.sensorReadings}
                sensors={this.props.sensors}
                timeOffset={this.props.timeOffset} />}
          </Col>
        </Row>}
    </Page>;
  }
}
