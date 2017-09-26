import * as React from "react";
import { connect } from "react-redux";
import { HardwareSettings } from "./components/hardware_settings";
import { FarmbotOsSettings } from "./components/farmbot_os_settings";
import { Page, Col, Row } from "../ui";
import { mapStateToProps } from "./state_to_props";
import { Props } from "./interfaces";
import * as moment from "moment";
import { StatusRowProps, ConnectivityPanel } from "./connectivity/index";
import { botToMQTT, botToAPI, browserToMQTT } from "./connectivity/status_checks";
import { Diagnosis, DiagnosisProps } from "./connectivity/diagnosis";

@connect(mapStateToProps)
export class Devices extends React.Component<Props, {}> {
  state = { online: navigator.onLine };

  /** A record of all the things we know about connectivity right now. */
  get flags(): Record<keyof DiagnosisProps, StatusRowProps> {
    const mqttUrl = this.props.auth && this.props.auth.token.unencoded.mqtt;
    const mqttConnected = this.props.bot.connectedToMQTT;
    const lastSeen = this.props.deviceAccount.body.last_seen;
    const timstamp = this.props.bot.hardware.user_env["LAST_CLIENT_CONNECTED"];
    return {
      botMQTT: botToMQTT(timstamp),
      botAPI: botToAPI(lastSeen ? moment(lastSeen) : undefined, moment()),
      userMQTT: browserToMQTT(mqttUrl, mqttConnected)
    };
  }

  /** Shuffle these around to change the ordering of the status table. */
  get rowData(): StatusRowProps[] {
    return [this.flags.botMQTT, this.flags.botAPI, this.flags.userMQTT];
  }

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
            <ConnectivityPanel rowData={this.rowData}>
              <Diagnosis
                botMQTT={!!this.flags.botMQTT.connectionStatus}
                botAPI={!!this.flags.botAPI.connectionStatus}
                userMQTT={!!this.flags.userMQTT.connectionStatus} />
            </ConnectivityPanel>
          </Col>
        </Row>
      </Page>;
    } else {
      throw new Error("Log in first");
    }
  }
}
