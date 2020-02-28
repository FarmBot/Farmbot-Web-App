import { connect, MqttClient } from "mqtt";
import React from "react";
import { uuid } from "farmbot";
import axios from "axios";
import { ExternalUrl } from "../external_urls";
import { t } from "../i18next_wrapper";

interface State {
  error: Error | undefined;
  stage: string;
}

const WS_CONFIG = {
  username: "farmbot_demo",
  password: "required, but not used.",
};

const SECRET = uuid().split("-").join("");
export const MQTT_CHAN = "demos/" + SECRET;
const HTTP_URL = "/api/demo_account";
export const EASTER_EGG = "BIRDS AREN'T REAL";
export const WAITING_ON_API = "Planting your demo garden...";

// APPLICATION CODE ==============================
export class DemoIframe extends React.Component<{}, State> {
  state: State =
    { error: undefined, stage: t("DEMO THE APP") };

  setError = (error?: Error) => this.setState({ error });

  connectMqtt = (): Promise<MqttClient> => {
    const client = connect(globalConfig.MQTT_WS, WS_CONFIG);
    return new Promise(resolve => {
      client.on("message", this.handleMessage);
      client.subscribe(MQTT_CHAN, this.setError);
      client.on("connect", resolve);
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
        <source src={ExternalUrl.Video.desktop} type="video/mp4" />
      </video>
      <img className="demo-phone" src={ExternalUrl.Video.mobile} />
      <button className="demo-button"
        title={t("demo the app")}
        onClick={this.requestAccount}>
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
