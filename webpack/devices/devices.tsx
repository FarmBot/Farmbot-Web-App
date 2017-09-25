import * as React from "react";
import { connect } from "react-redux";
import { HardwareSettings } from "./components/hardware_settings";
import { FarmbotOsSettings } from "./components/farmbot_os_settings";
import { Page, Col, Row } from "../ui";
import { mapStateToProps } from "./state_to_props";
import { Props } from "./interfaces";
import { ConnectivityPanel, StatusRowProps } from "./connectivity_panel";
import * as moment from "moment";
import { isUndefined } from "lodash";

@connect(mapStateToProps)
export class Devices extends React.Component<Props, {}> {
  state = { online: navigator.onLine };
  get rowData(): StatusRowProps[] {
    const mqttUrl = this.props.auth && this.props.auth.token.unencoded.mqtt;
    const mqttConnected = this.props.bot.connectedToMQTT;
    const lastSeen = this.props.deviceAccount.body.last_seen;
    const timstmp = this.props.bot.hardware.user_env["LAST_CLIENT_CONNECTED"];
    return [
      botToMQTT(timstmp),
      botToAPI(lastSeen ? moment(lastSeen) : undefined, moment()),
      browserToMQTT(mqttUrl, mqttConnected)
    ];
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
            <ConnectivityPanel rowData={this.rowData} />
          </Col>
        </Row>
      </Page>;
    } else {
      throw new Error("Log in first");
    }
  }
}

const HOUR = 1000 * 60 * 60;
const TWO_HOURS = HOUR * 2;
function botToAPI(lastSeen: moment.Moment | undefined,
  now = moment()): StatusRowProps {
  const status: StatusRowProps = {
    from: "Bot",
    connectionStatus: undefined,
    to: "API",
    children: "?"
  };

  const diff = lastSeen && lastSeen.diff(now);

  if (isUndefined(diff) || (diff > TWO_HOURS)) {
    status.connectionStatus = false;
    status.children = "Have not heard from bot in over 2 hours.";
  } else {
    status.connectionStatus = true;
    const t = moment(lastSeen).fromNow();
    status.children = `Bot sent message to server ${t}`;
  }

  return status;
}

function botToMQTT(lastSeen: string | undefined): StatusRowProps {
  const output: StatusRowProps = {
    from: "Bot",
    to: "MQTT",
    connectionStatus: false,
    children: "We are not seeing any realtime messages from the bot right now."
  };

  if (lastSeen) {
    output.connectionStatus = true;
    output.children = `Connected ${moment(new Date(JSON.parse(lastSeen))).fromNow()}`;
  }

  return output;
}

function browserToMQTT(mqttUrl: string | undefined, online?: boolean): StatusRowProps {
  const url = `mqtt://${mqttUrl}`;
  return {
    from: "Browser",
    to: "MQTT",
    children: online ? ("Connected to  " + url) : "Unable to connect",
    connectionStatus: online
  };
}
