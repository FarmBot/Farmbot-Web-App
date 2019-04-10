import * as React from "react";
import { connect } from "react-redux";
import { HardwareSettings } from "./components/hardware_settings";
import { FarmbotOsSettings } from "./components/farmbot_os_settings";
import { Page, Col, Row } from "../ui/index";
import { mapStateToProps } from "./state_to_props";
import { Props } from "./interfaces";
import { PinBindings } from "./pin_bindings/pin_bindings";
import { selectAllDiagnosticDumps } from "../resources/selectors";
import { ConnectivityPanel } from "./connectivity";
import { getStatus } from "../connectivity/reducer_support";

@connect(mapStateToProps)
export class Devices extends React.Component<Props, {}> {
  render() {
    if (this.props.auth) {
      const { botToMqtt } = this.props;
      const botToMqttStatus = getStatus(botToMqtt);
      const botToMqttLastSeen = (botToMqtt && botToMqttStatus === "up")
        ? botToMqtt.at
        : "";
      return <Page className="device-page">
        <Row>
          <Col xs={12} sm={6}>
            <FarmbotOsSettings
              diagnostics={selectAllDiagnosticDumps(this.props.resources)}
              account={this.props.deviceAccount}
              dispatch={this.props.dispatch}
              bot={this.props.bot}
              timeSettings={this.props.timeSettings}
              botToMqttLastSeen={botToMqttLastSeen}
              botToMqttStatus={botToMqttStatus}
              sourceFbosConfig={this.props.sourceFbosConfig}
              shouldDisplay={this.props.shouldDisplay}
              isValidFbosConfig={this.props.isValidFbosConfig}
              env={this.props.env}
              saveFarmwareEnv={this.props.saveFarmwareEnv} />
            <ConnectivityPanel
              status={this.props.deviceAccount.specialStatus}
              bot={this.props.bot}
              dispatch={this.props.dispatch}
              deviceAccount={this.props.deviceAccount} />
          </Col>
          <Col xs={12} sm={6}>
            <HardwareSettings
              controlPanelState={this.props.bot.controlPanelState}
              dispatch={this.props.dispatch}
              bot={this.props.bot}
              botToMqttStatus={botToMqttStatus}
              shouldDisplay={this.props.shouldDisplay}
              sourceFwConfig={this.props.sourceFwConfig}
              firmwareConfig={this.props.firmwareConfig} />
            <PinBindings
              dispatch={this.props.dispatch}
              resources={this.props.resources} />
          </Col>
        </Row>
      </Page>;
    } else {
      throw new Error("Log in first");
    }
  }
}
