import { connect, MqttClient } from "mqtt";
import { detectLanguage } from "../i18n";
import { shortRevision, attachToRoot } from "../util";
import { stopIE } from "../util/stop_ie";
import I from "i18next";
import React from "react";

interface State {
  client?: MqttClient;
  connected: boolean;
}

const WS_CONFIG = {
  username: "farmbot_guest",
  protocolId: "MQIsdp",
  protocolVersion: 3
};

export class DemoLoader extends React.Component<{}, State> {
  state = {
    client: undefined,
    connected: false
  };

  componentWillMount() {
    const client = connect(globalConfig.MQTT_WS, WS_CONFIG);
    client.on("packetreceive",
      (x) => console.log("Packet: " + JSON.stringify(x)));
    client.on("connect", () => {
      this.setState({ connected: true });
    });
    this.setState({ client });
  }

  render() {
    return <div>Hello, world!</div>;
  }
}

stopIE();

console.log(shortRevision());

detectLanguage().then((config) => {
  I.init(config, () => {
    attachToRoot(DemoLoader);
  });
});
