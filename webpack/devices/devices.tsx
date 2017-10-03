import * as React from "react";
import { connect } from "react-redux";
import { HardwareSettings } from "./components/hardware_settings";
import { FarmbotOsSettings } from "./components/farmbot_os_settings";
import { Page, Col, Row } from "../ui";
import { mapStateToProps } from "./state_to_props";
import { Props } from "./interfaces";
import * as moment from "moment";
import { ConnectivityPanel } from "./connectivity/index";
import {
  botToMQTT, botToAPI, browserToMQTT, botToFirmware, browserToAPI
} from "./connectivity/status_checks";
import { Diagnosis, DiagnosisName } from "./connectivity/diagnosis";
import { StatusRowProps } from "./connectivity/connectivity_row";
import { refresh } from "../api/crud";

@connect(mapStateToProps)
export class Devices extends React.Component<Props, {}> {
  state = { online: navigator.onLine };

  /** A record of all the things we know about connectivity right now. */
  get flags(): Record<DiagnosisName, StatusRowProps> {
    const mqttConnected =
      this.props.userToMqtt && this.props.userToMqtt.state === "up";
    const botApiTimestamp = this.props.deviceAccount.body.last_saw_api;
    const fwVersion = this.props.bot.hardware
      .informational_settings.firmware_version;

    return {
      userMQTT: browserToMQTT(mqttConnected),
      userAPI: browserToAPI(this.props.userToApi),
      botMQTT: botToMQTT(this.props.botToMqtt),
      botAPI: botToAPI(botApiTimestamp ? moment(botApiTimestamp) : undefined, moment()),
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
    this
      .props
      .dispatch(refresh(this.props.deviceAccount));
  };

  render() {
    if (this.props.auth) {
      return <Page className="devices">
        <Row>
          <Col xs={12} sm={6}>
            <FarmbotOsSettings
              account={this.props.deviceAccount}
              dispatch={this.props.dispatch}
              bot={this.props.bot}
              auth={this.props.auth} />
          </Col>
          <Col xs={12} sm={6}>
            <HardwareSettings
              controlPanelState={this.props.bot.controlPanelState}
              dispatch={this.props.dispatch}
              bot={this.props.bot} />
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={6}>
            <ConnectivityPanel
              status={this.props.deviceAccount.specialStatus}
              onRefresh={this.refresh}
              rowData={this.rowData}>
              <Diagnosis
                userAPI={!!this.flags.userAPI}
                userMQTT={!!this.flags.userMQTT.connectionStatus}
                botMQTT={!!this.flags.botMQTT.connectionStatus}
                botAPI={!!this.flags.botAPI.connectionStatus}
                botFirmware={!!this.flags.botFirmware.connectionStatus} />
            </ConnectivityPanel>
          </Col>
        </Row>
      </Page>;
    } else {
      throw new Error("Log in first");
    }
  }
}
