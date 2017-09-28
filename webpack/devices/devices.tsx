import * as React from "react";
import { connect } from "react-redux";
import { HardwareSettings } from "./components/hardware_settings";
import { FarmbotOsSettings } from "./components/farmbot_os_settings";
import { Page, Col, Row } from "../ui";
import { mapStateToProps } from "./state_to_props";
import { Props } from "./interfaces";
import * as moment from "moment";
import { ConnectivityPanel } from "./connectivity/index";
import { botToMQTT, botToAPI, browserToMQTT } from "./connectivity/status_checks";
import { Diagnosis, DiagnosisProps } from "./connectivity/diagnosis";
import { StatusRowProps } from "./connectivity/connectivity_row";
import { refresh } from "../api/crud";

@connect(mapStateToProps)
export class Devices extends React.Component<Props, {}> {
  state = { online: navigator.onLine };

  /** A record of all the things we know about connectivity right now. */
  get flags(): Record<keyof DiagnosisProps, StatusRowProps> {
    const mqttConnected = this.props.bot.connectedToMQTT;
    const lastSeen = this.props.deviceAccount.body.last_seen;
    const timestamp = this.props.bot.hardware.user_env["LAST_CLIENT_CONNECTED"];
    return {
      botMQTT: botToMQTT(timestamp),
      botAPI: botToAPI(lastSeen ? moment(lastSeen) : undefined, moment()),
      userMQTT: browserToMQTT(mqttConnected)
    };
  }

  /** Shuffle these around to change the ordering of the status table. */
  get rowData(): StatusRowProps[] {
    return [this.flags.userMQTT, this.flags.botMQTT, this.flags.botAPI];
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
