import * as React from "react";
import { ImageFlipperProps, ImageFlipperState } from "./interfaces";
import { Content } from "../../constants";
import { t } from "../../i18next_wrapper";

export const PLACEHOLDER_FARMBOT = "/placeholder_farmbot.jpg";

/** Placeholder image with text overlay. */
const PlaceholderImg = ({ textOverlay }: { textOverlay: string }) =>
  <div className="no-flipper-image-container">
    <p>{t(textOverlay)}</p>
    <img
      className="image-flipper-image"
      src={PLACEHOLDER_FARMBOT} />
  </div>;

export class ImageFlipper extends
  React.Component<ImageFlipperProps, Partial<ImageFlipperState>> {

  state: ImageFlipperState = {
    isLoaded: false,
    disableNext: true,
    disablePrev: false
  };

  imageJSX = () => {
    if (this.props.images.length > 0) {
      const image = this.props.currentImage || this.props.images[0];
      const url = image.body.attachment_processed_at
        ? image.body.attachment_url
        : PLACEHOLDER_FARMBOT;
      return <div>
        {!this.state.isLoaded &&
          <PlaceholderImg
            textOverlay={t("Image loading (try refreshing)")} />}
        <img
          onLoad={() => this.setState({ isLoaded: true })}
          className={`image-flipper-image is-loaded-${this.state.isLoaded}`}
          src={url} />
      </div>;
    } else {
      return <PlaceholderImg
        textOverlay={Content.NO_IMAGES_YET} />;
    }
  }

  go = (increment: -1 | 1) => () => {
    const { images, currentImage } = this.props;
    const uuids = images.map(x => x.uuid);
    const currentIndex = currentImage ? uuids.indexOf(currentImage.uuid) : 0;
    const nextIndex = currentIndex + increment;
    const tooHigh = (index: number): boolean => index > (uuids.length - 1);
    const tooLow = (index: number): boolean => index < 0;
    if (!tooHigh(nextIndex) && !tooLow(nextIndex)) {
      this.props.onFlip(uuids[nextIndex]);
    }
    const indexAfterNext = currentIndex + (increment * 2);
    this.setState({
      disableNext: tooLow(indexAfterNext),
      disablePrev: tooHigh(indexAfterNext)
    });
  }

  render() {
    const multipleImages = this.props.images.length > 1;
    return <div className="image-flipper">
      <this.imageJSX />
      <button
        onClick={this.go(1)}
        disabled={!multipleImages || this.state.disablePrev}
        className="image-flipper-left fb-button">
        {t("Prev")}
      </button>
      <button
        onClick={this.go(-1)}
        disabled={!multipleImages || this.state.disableNext}
        className="image-flipper-right fb-button">
        {t("Next")}
      </button>
    </div>;
  }
}
