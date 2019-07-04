import { connect, MqttClient } from "mqtt";
import React from "react";
import { uuid } from "farmbot";
import axios from "axios";

interface State {
  client?: MqttClient;
  error: Error | undefined;
  stage: string;
}

const VIDEO_URL =
  "https://cdn.shopify.com/s/files/1/2040/0289/files/Farm_Designer_Loop.mp4?9552037556691879018";
const PHONE_URL =
  "https://cdn.shopify.com/s/files/1/2040/0289/files/Controls.png?9668345515035078097";
const WS_CONFIG = {
  username: "farmbot_demo",
  password: "required, but not used.",
};

const SECRET = uuid().split("-").join("");
const MQTT_CHAN = "demos/" + SECRET;
const HTTP_URL = "/api/demo_account";
const EASTER_EGG = "BIRDS AREN'T REAL";
export const WAITING_ON_API = "Planting your demo garden...";

// APPLICATION CODE ==============================

export class DemoIframe extends React.Component<{}, State> {
  state: State = {
    client: undefined,
    error: undefined,
    stage: "DEMO THE APP"
  };

  setError = (error?: Error) => this.setState({ error });

  connectMqtt = (): Promise<MqttClient> => {
    const client = connect(globalConfig.MQTT_WS, WS_CONFIG);
    this.setState({ stage: WAITING_ON_API });
    return new Promise(resolve => {
      this.setState({ stage: "Connecting garden hose..." });
      client.on("connect", () => {
        this.setState({ stage: "Opening seed packet..." });
        this.setState({ client });
        client.on("message", this.handleMessage);
        client.subscribe(MQTT_CHAN, this.setError);
        resolve(client);
      });
    });
  }

  connectApi = () => {
    const is51 = (Math.round(Math.random() * 100) == 51);
    is51 && this.setState({ stage: EASTER_EGG });
    return axios
      .post<string>(HTTP_URL, { secret: SECRET })
      .then(() => this.setState({ stage: WAITING_ON_API }))
      .catch(this.setError);
  }

  handleMessage =
    (_chan: string, _buffer: Buffer) => {
      localStorage.setItem("session", _buffer.toString());
      location.assign("/app/designer/plants");
    }

  requestAccount = () => {
    return this.connectMqtt().then(this.connectApi);
  };

  ok = () => {

    return <div className="demo-container">
      <video muted={true} autoPlay={true} loop={true} className="demo-video">
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <img className="demo-phone" src={PHONE_URL} />
      <button className="demo-button" onClick={this.requestAccount}>
        {this.state.stage}
      </button>
    </div>;
  };

  no = () => {
    // tslint:disable-next-line:no-null-keyword
    const message = JSON.stringify(this.state.error, null, 2);

    return <pre> {message} </pre>;
  }

  render() {
    return this.state.error ?
      this.no() : this.ok();
  }
}
