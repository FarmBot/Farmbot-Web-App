import * as React from "react";
import { connect } from "react-redux";
import { Peripherals } from "./peripherals";
import { Sensors } from "./sensors";
import { Row, Page, Col } from "../ui/index";
import { mapStateToProps } from "./state_to_props";
import { WebcamPanel } from "./webcam";
import { Props } from "./interfaces";
import { Move } from "./move/move";
import { BooleanSetting } from "../session_keys";
import { SensorReadings } from "./sensor_readings/sensor_readings";
import { isBotOnline } from "../devices/must_be_online";
import { hasSensors } from "../devices/components/firmware_hardware_support";

/** Controls page. */
export class RawControls extends React.Component<Props, {}> {
  get arduinoBusy() {
    return !!this.props.bot.hardware.informational_settings.busy;
  }

  get botOnline() {
    return isBotOnline(
      this.props.bot.hardware.informational_settings.sync_status,
      this.props.botToMqttStatus);
  }

  get hideSensors() {
    return this.props.getWebAppConfigVal(BooleanSetting.hide_sensors)
      || !hasSensors(this.props.firmwareHardware);
  }

  move = () => <Move
    bot={this.props.bot}
    env={this.props.env}
    dispatch={this.props.dispatch}
    arduinoBusy={this.arduinoBusy}
    botToMqttStatus={this.props.botToMqttStatus}
    firmwareSettings={this.props.firmwareSettings}
    firmwareHardware={this.props.firmwareHardware}
    getWebAppConfigVal={this.props.getWebAppConfigVal} />

  peripherals = () => <Peripherals
    firmwareHardware={this.props.firmwareHardware}
    bot={this.props.bot}
    peripherals={this.props.peripherals}
    dispatch={this.props.dispatch}
    disabled={this.arduinoBusy || !this.botOnline} />

  webcams = () => <WebcamPanel
    feeds={this.props.feeds}
    dispatch={this.props.dispatch} />

  sensors = () => this.hideSensors
    ? <div id="hidden-sensors-widget" />
    : <Sensors
      firmwareHardware={this.props.firmwareHardware}
      bot={this.props.bot}
      sensors={this.props.sensors}
      dispatch={this.props.dispatch}
      disabled={this.arduinoBusy || !this.botOnline} />

  sensorReadings = () => this.hideSensors
    ? <div id="hidden-sensor-history-widget" />
    : <SensorReadings
      sensorReadings={this.props.sensorReadings}
      sensors={this.props.sensors}
      timeSettings={this.props.timeSettings} />

  render() {
    const showWebcamWidget =
      !this.props.getWebAppConfigVal(BooleanSetting.hide_webcam_widget);
    return <Page className="controls-page">
      {showWebcamWidget
        ?
        <Row>
          <Col xs={12} sm={6} md={5} mdOffset={1}>
            <this.move />
            <this.peripherals />
          </Col>
          <Col xs={12} sm={6}>
            <this.webcams />
            <this.sensors />
            <this.sensorReadings />
          </Col>
        </Row>
        :
        <Row>
          <Col xs={12} sm={6} md={5} mdOffset={1}>
            <this.move />
          </Col>
          <Col xs={12} sm={5}>
            <this.peripherals />
            <this.sensors />
            <this.sensorReadings />
          </Col>
        </Row>}
    </Page>;
  }
}

export const Controls = connect(mapStateToProps)(RawControls);
