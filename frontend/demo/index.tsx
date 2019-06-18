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
const VIDEO_URL =
  "https://cdn.shopify.com/s/files/1/2040/0289/files/Farm_Designer_Loop.mp4?9552037556691879018";
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
    stage: "DEMO THE APP"
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
    (Math.round(Math.random() * 100) == 51) &&
      this.setState({ stage: "BIRDS AREN'T REAL" });
    axios
      .post<string>(HTTP_URL, { secret: SECRET })
      .then(() => {
        this.setState({ stage: "Planting your demo garden..." });
      })
      .catch(this.setError);
  };

  ok = () => {

    return <div className="demo-container">
      <video muted={true} autoPlay={true} loop={true} className="demo-video">
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <button className="demo-button" onClick={this.requestAccount}>
        {this.state.stage}
      </button>
    </div>;
  };

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
