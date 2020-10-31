import React from "react";
import moment from "moment";
import { success, error } from "../../toast/toast";
import {
  getIndexOfUuid, getNextIndexes, ImageFlipper, selectNextImage,
} from "./image_flipper";
import {
  PhotosProps, PhotoButtonsProps, PhotoFooterProps, PhotosComponentState,
} from "./interfaces";
import { getDevice } from "../../device";
import { Content } from "../../constants";
import { timeFormatString } from "../../util";
import { destroy } from "../../api/crud";
import { downloadProgress } from "../../settings/fbos_settings/os_update_button";
import { startCase } from "lodash";
import { MustBeOnline } from "../../devices/must_be_online";
import { t } from "../../i18next_wrapper";
import { cameraBtnProps } from "../capture_settings/camera_selection";
import { Overlay, Popover } from "@blueprintjs/core";
import { ImageShowMenu, ImageShowMenuTarget } from "./image_show_menu";
import { setShownMapImages } from "./actions";
import { TaggedImage, Xyz } from "farmbot";
import { MarkedSlider } from "../../ui";

const PhotoButtons = (props: PhotoButtonsProps) => {
  const imageUploadJobProgress = downloadProgress(props.imageJobs[0]);
  const camDisabled = cameraBtnProps(props.env);
  return <div className="farmware-button">
    <MustBeOnline
      syncStatus={props.syncStatus}
      networkState={props.botToMqttStatus}
      hideBanner={true}
      lockOpen={process.env.NODE_ENV !== "production"}>
      <button
        className={`fb-button green ${camDisabled.class}`}
        title={camDisabled.title}
        onClick={camDisabled.click || props.takePhoto}>
        {t("Take Photo")}
      </button>
    </MustBeOnline>
    <button
      className="fb-button red"
      title={t("Delete Photo")}
      onClick={props.deletePhoto}>
      <i className={"fa fa-trash"} />
    </button>
    <a
      className="fb-button blue"
      title={t("Download Photo")}
      href={props.imageUrl}
      target={"_blank"}
      rel={"noreferrer"}
      download={true}>
      <i className={"fa fa-download"} />
    </a>
    <button
      className="fb-button yellow"
      title={t("Toggle crop")}
      disabled={!props.canCrop}
      onClick={props.toggleCrop}>
      <i className={"fa fa-scissors"} />
    </button>
    <button
      className="fb-button yellow"
      title={t("Toggle rotation")}
      disabled={!props.canTransform}
      onClick={props.toggleRotation}>
      <i className={"fa fa-repeat"} />
    </button>
    <button
      className={"fb-button gray desktop-only"}
      title={t("View fullscreen")}
      onClick={props.toggleFullscreen}>
      <i className={"fa fa-arrows-alt"} />
    </button>
    <p>
      {imageUploadJobProgress &&
        `${t("uploading photo")}...${imageUploadJobProgress}`}
    </p>
  </div>;
};

export const PhotoFooter = (props: PhotoFooterProps) => {
  const { image, timeSettings, dispatch, flags, size } = props;
  const created_at = image
    ? moment(image.body.created_at)
      .utcOffset(timeSettings.utcOffset)
      .format(`MMMM Do, YYYY ${timeFormatString(timeSettings)}`)
    : "";
  const imageShowMenuProps = { dispatch, flags, image, size };
  return <div className="photos-footer">
    <Popover className={"image-show-menu-target"}
      popoverClassName={"image-show-menu-popover"}>
      <ImageShowMenuTarget {...imageShowMenuProps} />
      <ImageShowMenu {...imageShowMenuProps} />
    </Popover>
    {image &&
      <div className={"image-created-at"}>
        <span>{created_at}</span>
      </div>}
    <div className={"image-metadata"}>
      {image
        ? ["x", "y", "z"].map((axis: Xyz, index) =>
          <div className={"meta-info"} key={index}>
            <label>{startCase(axis)}:</label>
            <span>{image.body.meta[axis] ?? "---"}</span>
          </div>)
        : <div className={"meta-info"}>
          <label>{t("Image")}:</label>
          <span>{t("No meta data.")}</span>
        </div>}
    </div>
  </div>;
};

export class Photos extends React.Component<PhotosProps, PhotosComponentState> {
  state: PhotosComponentState = {
    crop: true, rotate: true, fullscreen: false,
  };

  componentWillUnmount = () => this.props.dispatch(setShownMapImages(undefined));

  takePhoto = () => {
    const ok = () => success(t(Content.PROCESSING_PHOTO));
    const no = () => error(t("Error taking photo"));
    getDevice().takePhoto().then(ok, no);
  }

  deletePhoto = () => {
    const { dispatch, images } = this.props;
    const currentImageUuid = this.props.currentImage?.uuid;
    if (currentImageUuid) {
      dispatch(destroy(currentImageUuid))
        .then(() => {
          success(t("Image Deleted."));
          const { nextIndex } = getNextIndexes(images, currentImageUuid, 1);
          this.props.dispatch(selectNextImage(images, nextIndex));
        })
        .catch(() => error(t("Could not delete image.")));
    }
  }

  toggleCrop = () => this.setState({ crop: !this.state.crop });
  toggleRotation = () => this.setState({ rotate: !this.state.rotate });
  toggleFullscreen = () => this.setState({ fullscreen: !this.state.fullscreen });

  get canTransform() {
    return this.props.flags.sizeMatch && this.props.flags.zMatch;
  }
  get canCrop() { return this.canTransform && this.state.rotate; }

  ImageFlipper = ({ id }: { id: string }) =>
    <ImageFlipper id={id}
      currentImage={this.props.currentImage}
      dispatch={this.props.dispatch}
      currentImageSize={this.props.currentImageSize}
      transformImage={this.canCrop}
      getConfigValue={this.props.getConfigValue}
      env={this.props.env}
      crop={this.state.crop}
      images={this.props.images} />

  get highestIndex() { return this.props.images.length - 1; }

  getImageIndex = (image: TaggedImage | undefined) =>
    this.highestIndex - getIndexOfUuid(this.props.images, image?.uuid);

  renderLabel = (value: number) => {
    if (value == this.highestIndex) { return t("newest"); }
    if (value == 0) { return t("oldest"); }
    return "";
  }

  onSliderChange = (index: number) =>
    this.props.dispatch(selectNextImage(
      this.props.images,
      this.highestIndex - Math.min(index, this.highestIndex)))

  render() {
    return <div className="photos">
      <PhotoButtons
        syncStatus={this.props.syncStatus}
        botToMqttStatus={this.props.botToMqttStatus}
        takePhoto={this.takePhoto}
        deletePhoto={this.deletePhoto}
        toggleCrop={this.toggleCrop}
        toggleRotation={this.toggleRotation}
        toggleFullscreen={this.toggleFullscreen}
        imageUrl={this.props.currentImage?.body.attachment_url}
        canTransform={this.canTransform}
        canCrop={this.canCrop}
        env={this.props.env}
        imageJobs={this.props.imageJobs} />
      <this.ImageFlipper id={"panel-flipper"} />
      <Overlay isOpen={this.state.fullscreen}
        onClose={this.toggleFullscreen}>
        <this.ImageFlipper id={"fullscreen-flipper"} />
      </Overlay>
      <PhotoFooter
        image={this.props.currentImage}
        flags={this.props.flags}
        size={this.props.currentImageSize}
        dispatch={this.props.dispatch}
        timeSettings={this.props.timeSettings} />
      {this.props.images.length > 1 &&
        <MarkedSlider
          min={0}
          max={this.highestIndex}
          labelStepSize={Math.max(this.props.images.length, 2) - 1}
          labelRenderer={this.renderLabel}
          value={this.getImageIndex(this.props.currentImage)}
          onChange={this.onSliderChange}
          images={this.props.images}
          imageIndex={this.getImageIndex} />}
    </div>;
  }
}
