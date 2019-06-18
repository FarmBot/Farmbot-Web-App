import { connect, MqttClient } from "mqtt";
import { detectLanguage } from "../i18n";
import { shortRevision, attachToRoot } from "../util";
import { stopIE } from "../util/stop_ie";
import I from "i18next";
import React from "react";
import { uuid } from "farmbot";
import axios from "axios";

// TYPES AND INTERFACES ==========================

interface State {
  client?: MqttClient;
  error: Error | undefined;
  stage: string;
}

// CONSTANTS =====================================

const WS_CONFIG = {
  username: "farmbot_demo",
  password: "required, but not used.",
};

const SECRET = uuid().split("-").join("");
const MQTT_CHAN = "demos/" + SECRET;
const HTTP_URL = "/api/demo_account";

// APPLICATION CODE ==============================

export class DemoLoader extends React.Component<{}, State> {
  state: State = {
    client: undefined,
    error: undefined,
    stage: "Try FarmBot"
  };

  setError =
    (error?: Error) => this.setState({ error });

  componentWillMount() {
    const client =
      connect(globalConfig.MQTT_WS, WS_CONFIG);
    this.setState({ client });
    client.on("message", this.handleMessage);
    client.subscribe(MQTT_CHAN, this.setError);
  }

  handleMessage =
    (_chan: string, _buffer: Buffer) => {
      localStorage.setItem("session", _buffer.toString());
      location.assign("/app/designer/plants");
    }

  requestAccount = () => {
    this.setState({ stage: "Request sent" });

    axios
      .post<string>(HTTP_URL, { secret: SECRET })
      .then(() => {
        this.setState({ stage: "Request Received. Waiting" });
      })
      .catch(this.setError);
  };

  ok = () => <button onClick={this.requestAccount}>
    {this.state.stage}
  </button>;

  no = () => {
    const message =
      // tslint:disable-next-line:no-null-keyword
      JSON.stringify(this.state.error, null, 2);

    return <pre>
      {message}
    </pre>;
  }

  render() {
    return this.state.error ?
      this.no() : this.ok();
  }
}

// BOOTSTRAPPING CODE ============================

stopIE();

console.log(shortRevision());

detectLanguage().then((config) => {
  I.init(config, () => {
    attachToRoot(DemoLoader);
  });
});
