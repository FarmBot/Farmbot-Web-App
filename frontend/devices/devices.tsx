import * as React from "react";
import { connect } from "react-redux";
import { HardwareSettings } from "./components/hardware_settings";
import { FarmbotOsSettings } from "./components/farmbot_os_settings";
import { Page, Col, Row } from "../ui/index";
import { mapStateToProps } from "./state_to_props";
import { Props } from "./interfaces";
import { isFwHardwareValue } from "./components/firmware_hardware_support";
import { maybeOpenPanel } from "./components/maybe_highlight";

export class RawDevices extends React.Component<Props, {}> {

  componentDidMount = () =>
    this.props.dispatch(maybeOpenPanel(this.props.bot.controlPanelState));

  render() {
    if (this.props.auth) {
      const { value } = this.props.sourceFbosConfig("firmware_hardware");
      const firmwareHardware = isFwHardwareValue(value) ? value : undefined;
      return <Page className="device-page">
        <Row>
          <Col xs={12} sm={6}>
            <FarmbotOsSettings
              deviceAccount={this.props.deviceAccount}
              dispatch={this.props.dispatch}
              alerts={this.props.alerts}
              bot={this.props.bot}
              timeSettings={this.props.timeSettings}
              sourceFbosConfig={this.props.sourceFbosConfig}
              shouldDisplay={this.props.shouldDisplay}
              env={this.props.env}
              saveFarmwareEnv={this.props.saveFarmwareEnv} />
          </Col>
          <Col xs={12} sm={6}>
            <HardwareSettings
              controlPanelState={this.props.bot.controlPanelState}
              dispatch={this.props.dispatch}
              resources={this.props.resources}
              bot={this.props.bot}
              shouldDisplay={this.props.shouldDisplay}
              firmwareHardware={firmwareHardware}
              sourceFwConfig={this.props.sourceFwConfig}
              firmwareConfig={this.props.firmwareConfig} />
          </Col>
        </Row>
      </Page>;
    } else {
      throw new Error("Log in first");
    }
  }
}

export const Devices = connect(mapStateToProps)(RawDevices);
