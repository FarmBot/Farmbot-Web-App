import React from "react";
import { t } from "../../i18next_wrapper";
import {
  PlaceholderImg, PLACEHOLDER_FARMBOT,
} from "../../photos/images/image_flipper";
import { WebcamImgProps, WebcamImgState } from "./interfaces";

export class WebcamImg
  extends React.Component<WebcamImgProps, WebcamImgState> {
  state: WebcamImgState = { isLoaded: false, needsFallback: false };

  onError = () => this.setState({ needsFallback: true });
  onLoad = () => this.setState({ isLoaded: true });

  WebcamFeed = () => {
    const splitSrc = this.props.src.split(" ");
    const common = {
      onLoad: this.onLoad,
      onError: this.onError,
      style: this.state.isLoaded ? {} : { display: "none" },
    };
    return <div className={"webcam-stream-valid"}>
      {!this.state.isLoaded &&
        <PlaceholderImg textOverlay={t("Loading...")} />}
      {splitSrc[0] == "iframe"
        ? <iframe src={splitSrc[1]} {...common} />
        : <img src={this.props.src} {...common} />}
    </div>;
  };

  render() {
    return this.state.needsFallback
      ? <div className={"webcam-stream-unavailable"}>
        <img src={PLACEHOLDER_FARMBOT} />
        <p>{t("Unable to load webcam feed.")}</p>
      </div>
      : <this.WebcamFeed />;
  }
}
