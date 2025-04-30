import mqtt, { ClientSubscribeCallback, IConnackPacket } from "mqtt";
import React from "react";
import { uuid } from "farmbot";
import axios from "axios";
import { ExternalUrl } from "../external_urls";
import { t } from "../i18next_wrapper";
import { tourPath } from "../help/tours";
import { Path } from "../internal_urls";
import { FBSelect } from "../ui";
import { SEED_DATA_OPTIONS, SEED_DATA_OPTIONS_DDI } from "../messages/cards";

interface State {
  error: Error | undefined;
  stage: string;
  productLine: string;
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
  state: State = {
    error: undefined,
    stage: t("DEMO THE APP"),
    productLine: "genesis_1.8",
  };

  setError = (error?: Error) => this.setState({ error });

  connectMqtt = (): Promise<IConnackPacket> => {
    const client = mqtt.connect(globalConfig.MQTT_WS, WS_CONFIG);
    return new Promise(resolve => {
      client.on("message", this.handleMessage);
      client.subscribe(MQTT_CHAN, this.setError as ClientSubscribeCallback);
      client.on("connect", resolve);
    });
  };

  connectApi = () => {
    const is51 = (Math.round(Math.random() * 100) == 51);
    is51 && this.setState({ stage: EASTER_EGG });

    return axios
      .post<string>(HTTP_URL, {
        secret: SECRET,
        product_line: this.state.productLine,
      })
      .then(() => this.setState({ stage: WAITING_ON_API }))
      .catch(this.setError);
  };

  handleMessage =
    (_chan: string, _buffer: Buffer) => {
      localStorage.setItem("session", _buffer.toString());
      const stepUrl = Path.withApp(Path.plants());
      location.assign(tourPath(stepUrl, "gettingStarted", "intro"));
    };

  requestAccount = () => {
    this.connectMqtt().then(this.connectApi);
  };

  ok = () => {
    const selection = this.state.productLine;
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
      <FBSelect
        key={selection}
        extraClass={"demo-options"}
        list={SEED_DATA_OPTIONS(true).filter(x => x.value != "none")}
        customNullLabel={t("Select a model")}
        selectedItem={SEED_DATA_OPTIONS_DDI()[selection]}
        onChange={ddi => this.setState({ productLine: "" + ddi.value })} />
    </div>;
  };

  no = () => {
    console.error(this.state.error);
    const message = JSON.stringify(this.state.error, undefined, 2);
    return <pre>{message}: {"" + this.state.error}</pre>;
  };

  render() {
    return this.state.error ? this.no() : this.ok();
  }
}
