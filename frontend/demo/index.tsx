import { connect, MqttClient } from "mqtt";
import { detectLanguage } from "../i18n";
import { shortRevision, attachToRoot } from "../util";
import { stopIE } from "../util/stop_ie";
import I from "i18next";
import React from "react";
import { uuid } from "farmbot";

interface State {
  client?: MqttClient;
  connected: boolean;
  secret: string;
}

const WS_CONFIG = {
  username: "farmbot_guest",
  password: "required, but not used.",
  // protocolId: "MQIsdp",
  // protocolVersion: 3
};

export class DemoLoader extends React.Component<{}, State> {
  state: State = {
    client: undefined,
    connected: false,
    secret: uuid()
  };

  componentWillMount() {
    const client = connect(globalConfig.MQTT_WS, WS_CONFIG);

    client.on("close", (x: {}) => console.log("close" + JSON.stringify(x)));
    client.on("connect", (x: {}) => console.log("connect" + JSON.stringify(x)));
    client.on("disconnect", (x: {}) => console.log("disconnect" + JSON.stringify(x)));
    client.on("end", (x: {}) => console.log("end" + JSON.stringify(x)));
    client.on("error", (x: {}) => console.log("error" + JSON.stringify(x)));
    client.on("message", (x: {}) => console.log("message" + JSON.stringify(x)));
    client.on("offline", (x: {}) => console.log("offline" + JSON.stringify(x)));
    client.on("packetreceive", (x: {}) => console.log("packetreceive" + JSON.stringify(x)));
    client.on("packetsend", (x: {}) => console.log("packetsend" + JSON.stringify(x)));
    client.on("reconnect", (x: {}) => console.log("reconnect" + JSON.stringify(x)));

    const channel = "guest_registry." + this.state.secret;

    client.subscribe(channel, (error, ok) => {
      if (error) { console.error(error); } else { console.dir(ok); }
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
