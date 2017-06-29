import { ImageFlipperProps, ImageFlipperState } from "./interfaces";
import * as React from "react";
import { safeStringFetch } from "../util";
import { t } from "i18next";
import * as moment from "moment";

export const PLACEHOLDER_FARMBOT = "/placeholder_farmbot.jpg";

export class ImageFlipper
  extends React.Component<ImageFlipperProps, Partial<ImageFlipperState>> {

  state: ImageFlipperState = { isLoaded: false };

  imageJSX = () => {
    if (this.props.images.length > 0) {
      let i = this.props.currentImage || this.props.images[0];
      let url: string;
      url = (i.body.attachment_processed_at) ?
        i.body.attachment_url : PLACEHOLDER_FARMBOT;
      return <div>
        {!this.state.isLoaded && (
          <div className="no-flipper-image-container">
            <p>{t(`Image loading (try refreshing)`)}</p>
            <img
              className="image-flipper-image"
              src={PLACEHOLDER_FARMBOT} />
          </div>)}
        <img
          onLoad={() => this.setState({ isLoaded: true })}
          className={`image-flipper-image is-loaded-${this.state.isLoaded}`}
          src={url} />
      </div>;
    } else {
      return <div className="no-flipper-image-container">
        <p>{t(`You haven't yet taken any photos with your FarmBot.
          Once you do, they will show up here.`)}</p>
        <img
          className="image-flipper-image"
          src={PLACEHOLDER_FARMBOT} />
      </div>;
    }
  }

  metaDatas() {
    let i = this.props.currentImage;
    if (i) {
      let { meta } = i.body;
      return Object.keys(meta).sort().map(function (key, index) {
        return <MetaInfo key={index} attr={key} obj={meta} />;
      });
    } else {
      return <MetaInfo attr={"image"} obj={{ image: "No meta data." }} />;
    }
  }

  go = (increment: -1 | 1) => () => {
    let { images, currentImage } = this.props;
    let uuids = images.map(x => x.uuid);
    let currentIndex = currentImage ? uuids.indexOf(currentImage.uuid) : 0;
    let nextIndex = currentIndex + increment;
    let tooHigh = nextIndex > (uuids.length - 1);
    let tooLow = nextIndex < 0;
    if (!tooHigh && !tooLow) { this.props.onFlip(uuids[nextIndex]); }
  }

  render() {
    let image = this.imageJSX();
    let i = this.props.currentImage;
    return <div>
      <div className="row">
        <div className="col-sm-12">
          <div className="image-flipper">
            {image}
            <button
              onClick={this.go(1)}
              className="image-flipper-left fb-button"
            >
              {t("Prev")}
            </button>
            <button
              onClick={this.go(-1)}
              className="image-flipper-right fb-button"
            >
              {t("Next")}
            </button>
          </div>
        </div>
      </div>
      <div className="weed-detector-meta">
        {/** Separated from <MetaInfo /> for stylistic purposes. */}
        {i ?
          <div className="created-at">
            <label>{t("Created At")}</label>
            <span>
              {moment(i.body.created_at).format("MMMM Do, YYYY h:mma")}
            </span>
          </div>
          : ""}
        <div className="meta-coordinates">
          {this.metaDatas()}
        </div>
      </div>
    </div>;
  }
}

interface MetaInfoProps {
  /** Default conversion is `attr_name ==> Attr Name`.
   *  Setting a label property will over ride it to a differrent value.
   */
  label?: string;
  attr: string;
  obj: any; /** Really, it's OK here! See safeStringFetch */
}

function MetaInfo({ obj, attr, label }: MetaInfoProps) {
  let top = label || _.startCase(attr.split("_").join());
  let bottom = safeStringFetch(obj, attr);
  return <div className="coordinate">
    <label>{top}</label>
    <span>{bottom || "unknown"}</span>
  </div>;
}
