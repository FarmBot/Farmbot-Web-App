import * as React from "react";
import { connect } from "react-redux";
import { HardwareSettings } from "./components/hardware_settings";
import { FarmbotOsSettings } from "./components/farmbot_os_settings";
import { Page, Col, Row } from "../ui/index";
import { mapStateToProps } from "./state_to_props";
import { Props } from "./interfaces";
import { ConnectivityPanel } from "./connectivity/index";
import {
  botToMQTT, botToAPI, browserToMQTT, botToFirmware, browserToAPI
} from "./connectivity/status_checks";
import { Diagnosis, DiagnosisName } from "./connectivity/diagnosis";
import { StatusRowProps } from "./connectivity/connectivity_row";
import { resetConnectionInfo } from "./actions";
import { PinBindings } from "./pin_bindings/pin_bindings";
import { selectAllDiagnosticDumps } from "../resources/selectors";

@connect(mapStateToProps)
export class Devices extends React.Component<Props, {}> {
  state = { online: navigator.onLine };

  /** A record of all the things we know about connectivity right now. */
  get flags(): Record<DiagnosisName, StatusRowProps> {
    const fwVersion = this.props.bot.hardware
      .informational_settings.firmware_version;

    return {
      userMQTT: browserToMQTT(this.props.userToMqtt),
      userAPI: browserToAPI(this.props.userToApi),
      botMQTT: botToMQTT(this.props.botToMqtt),
      botAPI: botToAPI(this.props.deviceAccount.body.last_saw_api),
      botFirmware: botToFirmware(fwVersion),
    };
  }

  /** Shuffle these around to change the ordering of the status table. */
  get rowData(): StatusRowProps[] {
    return [
      this.flags.userAPI,
      this.flags.userMQTT,
      this.flags.botMQTT,
      this.flags.botAPI,
      this.flags.botFirmware,
    ];
  }

  refresh = () => {
    this.props.dispatch(resetConnectionInfo());
  };

  render() {
    if (this.props.auth) {
      const { botToMqtt } = this.props;
      const botToMqttStatus = botToMqtt ? botToMqtt.state : "down";
      const botToMqttLastSeen = (botToMqtt && botToMqttStatus === "up")
        ? botToMqtt.at
        : "";
      return <Page className="devices">
        <Row>
          <Col xs={12} sm={6}>
            <FarmbotOsSettings
              diagnostics={selectAllDiagnosticDumps(this.props.resources)}
              account={this.props.deviceAccount}
              dispatch={this.props.dispatch}
              bot={this.props.bot}
              botToMqttLastSeen={botToMqttLastSeen}
              botToMqttStatus={botToMqttStatus}
              sourceFbosConfig={this.props.sourceFbosConfig}
              shouldDisplay={this.props.shouldDisplay}
              isValidFbosConfig={this.props.isValidFbosConfig}
              env={this.props.env}
              saveFarmwareEnv={this.props.saveFarmwareEnv} />
            <ConnectivityPanel
              status={this.props.deviceAccount.specialStatus}
              onRefresh={this.refresh}
              rowData={this.rowData}
              fbosInfo={this.props.bot.hardware.informational_settings}>
              <Diagnosis
                userAPI={!!this.flags.userAPI}
                userMQTT={!!this.flags.userMQTT.connectionStatus}
                botMQTT={!!this.flags.botMQTT.connectionStatus}
                botAPI={!!this.flags.botAPI.connectionStatus}
                botFirmware={!!this.flags.botFirmware.connectionStatus} />
            </ConnectivityPanel>
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
