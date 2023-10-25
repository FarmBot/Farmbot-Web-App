import React from "react";
import {
  ImageFlipperProps, ImageFlipperState, PlaceholderImgProps,
} from "./interfaces";
import { Content, Actions } from "../../constants";
import { t } from "../../i18next_wrapper";
import { FlipperImage } from "./flipper_image";
import { selectImage, setShownMapImages } from "./actions";
import { TaggedImage } from "farmbot";
import { UUID } from "../../resources/interfaces";

export const PLACEHOLDER_FARMBOT = "/placeholder_farmbot.jpg";
export const PLACEHOLDER_FARMBOT_DARK = "/placeholder_farmbot_dark.jpg";

export const getIndexOfUuid = (images: TaggedImage[], uuid: UUID | undefined) =>
  uuid ? images.map(x => x.uuid).indexOf(uuid) : 0;

export const getNextIndexes = (
  images: TaggedImage[],
  currentImageUuid: UUID | undefined,
  increment: -1 | 1,
) => {
  const currentIndex = getIndexOfUuid(images, currentImageUuid);
  const nextIndex = currentIndex + increment;
  const indexAfterNext = currentIndex + (increment * 2);
  return { nextIndex, indexAfterNext };
};

export const selectNextImage = (images: TaggedImage[], index: number) =>
  (dispatch: Function) => {
    const nextImageUuid = images.map(x => x.uuid)[index];
    dispatch(selectImage(nextImageUuid));
    dispatch(setShownMapImages(nextImageUuid));
  };

/** Placeholder image with text overlay. */
export const PlaceholderImg = (props: PlaceholderImgProps) =>
  <div className={"no-flipper-image-container"}>
    <p>{t(props.textOverlay)}</p>
    <img className={"image-flipper-image placeholder"}
      src={props.dark ? PLACEHOLDER_FARMBOT_DARK : PLACEHOLDER_FARMBOT}
      width={props.width} height={props.height} />
  </div>;

export class ImageFlipper extends
  React.Component<ImageFlipperProps, ImageFlipperState> {
  state: ImageFlipperState = { disableNext: true, disablePrev: false };

  onImageLoad = (img: HTMLImageElement) => {
    this.props.dispatch({
      type: Actions.SET_IMAGE_SIZE,
      payload: { width: img.naturalWidth, height: img.naturalHeight }
    });
  };

  get uuids() { return this.props.images.map(x => x.uuid); }

  go = (increment: -1 | 1) => () => {
    const currentImageUuid = this.props.currentImage?.uuid;
    const { nextIndex, indexAfterNext } =
      getNextIndexes(this.props.images, currentImageUuid, increment);
    const tooHigh = (index: number): boolean => index > this.uuids.length - 1;
    const tooLow = (index: number): boolean => index < 0;
    if (!tooHigh(nextIndex) && !tooLow(nextIndex)) {
      this.props.flipActionOverride
        ? this.props.flipActionOverride(nextIndex)
        : this.props.dispatch(selectNextImage(this.props.images, nextIndex));
    }
    this.setState({
      disableNext: tooLow(indexAfterNext),
      disablePrev: tooHigh(indexAfterNext),
    });
  };

  render() {
    const { images, currentImage } = this.props;
    const multipleImages = images.length > 1;
    const dark = this.props.id === "fullscreen-flipper";
    return <div className={`image-flipper ${this.props.id}`} id={this.props.id}
      onKeyDown={e => {
        if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
          this.go(e.key == "ArrowLeft" ? 1 : -1)();
        }
      }}>
      {currentImage && images.length > 0
        ? <FlipperImage
          key={currentImage.body.attachment_url}
          crop={this.props.crop}
          transformImage={this.props.transformImage}
          dispatch={this.props.dispatch}
          getConfigValue={this.props.getConfigValue}
          flipperId={this.props.id}
          env={this.props.env}
          target={this.props.target}
          hover={this.props.hover}
          onImageLoad={this.onImageLoad}
          dark={dark}
          image={currentImage} />
        : <PlaceholderImg textOverlay={Content.NO_IMAGES_YET}
          dark={dark} />}
      {multipleImages && !this.state.disablePrev &&
        <button
          onClick={this.go(1)}
          autoFocus={this.props.autoFocus}
          title={t("previous image")}
          className="image-flipper-left fb-button">
          <i className={"fa fa-chevron-left"} />
        </button>}
      {multipleImages && !this.state.disableNext &&
        <button
          onClick={this.go(-1)}
          title={t("next image")}
          className="image-flipper-right fb-button">
          <i className={"fa fa-chevron-right"} />
        </button>}
    </div>;
  }
}
