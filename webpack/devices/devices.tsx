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

interface State {
  online: boolean;
}

@connect(mapStateToProps)
export class Devices extends React.Component<Props, State> {
  state = { online: false };
  get rowData(): StatusRowProps[] {
    const mqttUrl = this.props.auth && this.props.auth.token.unencoded.mqtt;
    const mqttConnected = this.props.bot.connectedToMQTT;
    const lastSeen = this.props.deviceAccount.body.last_seen;
    return [
      botToMQTT(),
      botToAPI(lastSeen ? moment(lastSeen) : undefined, moment()),
      browserToAPI(this.state.online),
      browserToMQTT(mqttUrl, mqttConnected)
    ];
  }

  componentDidMount() {
    window.addEventListener("online", () =>
      this.setState({ online: true }));
    window.addEventListener("offline", () =>
      this.setState({ online: false }));
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
  // less than 1 hour == probably OK
  // 1 -- 2 hours == questionable
  // > 2 bad!
  const diff = lastSeen && lastSeen.diff(now);
  if (isUndefined(diff) || (diff > TWO_HOURS)) {
    return {
      from: "TODO",
      to: "TODO",
      children: "TODO"
    };
  } else {
    return {
      from: "TODO",
      to: "TODO",
      children: "TODO"
    };

  }
}

function botToMQTT(): StatusRowProps {
  return {
    from: "TODO",
    to: "TODO",
    children: "TODO"
  };
}

function browserToAPI(isOnline: boolean): StatusRowProps {
  return {
    from: "TODO",
    to: "TODO",
    children: "TODO"
  };
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
