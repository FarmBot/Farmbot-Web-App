import * as React from "react";
import { ImageFlipperProps, ImageFlipperState } from "./interfaces";
import { Content } from "../../constants";
import { t } from "../../i18next_wrapper";
import { MapImage } from "../../farm_designer/map/layers/images/map_image";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import { isBotOriginQuadrant } from "../../farm_designer/interfaces";
import { getCameraCalibrationData } from "../../farm_designer/state_to_props";
import { cloneDeep } from "lodash";

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
    width: 0,
    height: 0,
    disableNext: true,
    disablePrev: false,
  };

  onImageLoad = (img: HTMLImageElement) => {
    this.setState({
      isLoaded: true,
      width: img.width,
      height: img.height,
    });
    this.props.imageLoadCallback(img);
  }

  SvgImageJSX = () => {
    const image = this.props.currentImage || this.props.images[0];
    const { getConfigValue } = this.props;
    const rawQuadrant = getConfigValue(NumericSetting.bot_origin_quadrant);
    const cameraCalibrationData = getCameraCalibrationData(this.props.env);
    cameraCalibrationData.scale = "1";
    const img = cloneDeep(image);
    img.body.meta.x = 0;
    img.body.meta.y = 0;
    img.body.id = -(image.body.id || 0);
    return <svg viewBox={`0 0 ${this.state.width} ${this.state.height}`}>
      <MapImage
        image={img}
        callback={this.onImageLoad}
        disableTranslation={true}
        hoveredMapImage={undefined}
        highlighted={false}
        cropImage={this.props.crop
          && !!getConfigValue(BooleanSetting.crop_images)}
        cameraCalibrationData={cameraCalibrationData}
        mapTransformProps={{
          quadrant: isBotOriginQuadrant(rawQuadrant) ? rawQuadrant : 2,
          gridSize: { x: 0, y: 0 },
          xySwap: !!getConfigValue(BooleanSetting.xy_swap),
        }} />
    </svg>;
  }

  imageJSX = () => {
    if (this.props.images.length > 0) {
      const image = this.props.currentImage || this.props.images[0];
      const url = image.body.attachment_processed_at
        ? image.body.attachment_url
        : PLACEHOLDER_FARMBOT;
      return <div className={"image-jsx"}>
        {!this.state.isLoaded &&
          <PlaceholderImg
            textOverlay={t("Image loading (try refreshing)")} />}
        {this.props.transformImage
          ? <this.SvgImageJSX />
          : <img
            onLoad={e => {
              this.setState({ isLoaded: true });
              this.props.imageLoadCallback(e.currentTarget);
            }}
            className={`image-flipper-image is-loaded-${this.state.isLoaded}`}
            src={url} />}
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
