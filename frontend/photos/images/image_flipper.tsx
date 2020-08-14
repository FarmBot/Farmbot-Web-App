import React from "react";
import { ImageFlipperProps, ImageFlipperState } from "./interfaces";
import { Content, Actions } from "../../constants";
import { t } from "../../i18next_wrapper";
import { FlipperImage } from "./flipper_image";

export const PLACEHOLDER_FARMBOT = "/placeholder_farmbot.jpg";

/** Placeholder image with text overlay. */
export const PlaceholderImg = ({ textOverlay }: { textOverlay: string }) =>
  <div className="no-flipper-image-container">
    <p>{t(textOverlay)}</p>
    <img className="image-flipper-image" src={PLACEHOLDER_FARMBOT} />
  </div>;

export class ImageFlipper extends
  React.Component<ImageFlipperProps, Partial<ImageFlipperState>> {
  state: ImageFlipperState = { disableNext: true, disablePrev: false };

  onImageLoad = (img: HTMLImageElement) => {
    this.props.dispatch({
      type: Actions.SET_IMAGE_SIZE,
      payload: { width: img.naturalWidth, height: img.naturalHeight }
    });
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
      {this.props.images.length > 0
        ? <FlipperImage
          crop={this.props.crop}
          transformImage={this.props.transformImage}
          dispatch={this.props.dispatch}
          getConfigValue={this.props.getConfigValue}
          env={this.props.env}
          onImageLoad={this.onImageLoad}
          image={this.props.currentImage || this.props.images[0]} />
        : <PlaceholderImg textOverlay={Content.NO_IMAGES_YET} />}
      <button
        onClick={this.go(1)}
        title={t("previous image")}
        disabled={!multipleImages || this.state.disablePrev}
        className="image-flipper-left fb-button">
        {t("Prev")}
      </button>
      <button
        onClick={this.go(-1)}
        title={t("next image")}
        disabled={!multipleImages || this.state.disableNext}
        className="image-flipper-right fb-button">
        {t("Next")}
      </button>
    </div>;
  }
}
