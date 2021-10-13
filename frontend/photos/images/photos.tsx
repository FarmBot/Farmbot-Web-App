import React from "react";
import moment from "moment";
import { success, error } from "../../toast/toast";
import {
  getIndexOfUuid, getNextIndexes, ImageFlipper, selectNextImage,
} from "./image_flipper";
import {
  PhotosProps, PhotoButtonsProps, PhotoFooterProps, PhotosComponentState,
  MoveToLocationProps,
} from "./interfaces";
import { formatTime } from "../../util";
import { destroy } from "../../api/crud";
import { downloadProgress } from "../../settings/fbos_settings/os_update_button";
import { isNumber, isUndefined, round, startCase } from "lodash";
import { isBotOnline, MustBeOnline } from "../../devices/must_be_online";
import { t } from "../../i18next_wrapper";
import { cameraBtnProps } from "../capture_settings/camera_selection";
import { Overlay } from "@blueprintjs/core";
import { ImageShowMenu, ImageShowMenuTarget } from "./image_show_menu";
import { setShownMapImages } from "./actions";
import { TaggedImage, Xyz } from "farmbot";
import { MarkedSlider, Popover } from "../../ui";
import { takePhoto } from "../../devices/actions";
import { push } from "../../history";
import { locationUrl } from "../../farm_designer/move_to";

const PhotoButtons = (props: PhotoButtonsProps) => {
  const imageUploadJobProgress = downloadProgress(props.imageJobs[0]);
  const camDisabled = cameraBtnProps(props.env);
  return <div className="farmware-button">
    <MustBeOnline
      syncStatus={props.syncStatus}
      networkState={props.botToMqttStatus}
      hideBanner={true}>
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
    ? formatTime(moment(image.body.created_at), timeSettings, "MMMM Do, YYYY")
    : "";
  const imageShowMenuProps = { dispatch, flags, image, size };
  return <div className="photos-footer">
    {flags &&
      <Popover className={"image-show-menu-target"}
        popoverClassName={"image-show-menu-popover"}
        target={<ImageShowMenuTarget {...imageShowMenuProps} flags={flags} />}
        content={<ImageShowMenu {...imageShowMenuProps} flags={flags} />} />}
    {image &&
      <div className={"image-created-at"}>
        <span>{created_at}</span>
      </div>}
    <div className={"image-metadata"}>
      {image
        ? ["x", "y", "z"].map((axis: Xyz, index) =>
          <Popover key={index}
            target={<div className={"meta-info"}>
              <label>{startCase(axis)}:</label>
              <span>{image.body.meta[axis] ?? "---"}</span>
            </div>}
            content={<MoveToLocation
              imageLocation={image.body.meta}
              botOnline={props.botOnline} />} />)
        : <div className={"meta-info"}>
          <label>{t("Image")}:</label>
          <span>{t("No meta data.")}</span>
        </div>}
      {!isUndefined(props.distance) &&
        <div className={"meta-info"}>
          <label>{t("Distance")}:</label>
          <span>{round(props.distance)}</span>
        </div>}
    </div>
  </div>;
};

export const MoveToLocation = (props: MoveToLocationProps) =>
  <button
    className={"fb-button gray no-float"}
    type={"button"}
    title={t("move to location")}
    onClick={() =>
      isNumber(props.imageLocation.x) &&
      isNumber(props.imageLocation.y) &&
      push(locationUrl({
        x: props.imageLocation.x,
        y: props.imageLocation.y,
        z: props.imageLocation.z,
      }))}>
    {t("Move FarmBot to location")}
  </button>;

export class Photos extends React.Component<PhotosProps, PhotosComponentState> {
  state: PhotosComponentState = {
    crop: true, rotate: true, fullscreen: false,
  };

  componentWillUnmount = () => this.props.dispatch(setShownMapImages(undefined));

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
  };

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
      images={this.props.images} />;

  get highestIndex() { return this.props.images.length - 1; }

  getImageIndex = (image: TaggedImage | undefined) =>
    this.highestIndex - getIndexOfUuid(this.props.images, image?.uuid);

  renderLabel = (value: number) => {
    if (value == this.highestIndex) { return t("newest"); }
    if (value == 0) { return t("oldest"); }
    return "";
  };

  onSliderChange = (index: number) =>
    this.props.dispatch(selectNextImage(
      this.props.images,
      this.highestIndex - Math.min(index, this.highestIndex)));

  render() {
    return <div className="photos">
      <PhotoButtons
        syncStatus={this.props.syncStatus}
        botToMqttStatus={this.props.botToMqttStatus}
        takePhoto={takePhoto}
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
        botOnline={isBotOnline(this.props.syncStatus, this.props.botToMqttStatus)}
        timeSettings={this.props.timeSettings} />
      {this.props.images.length > 1 &&
        <MarkedSlider
          min={0}
          max={this.highestIndex}
          labelStepSize={Math.max(this.props.images.length, 2) - 1}
          labelRenderer={this.renderLabel}
          value={this.getImageIndex(this.props.currentImage)}
          onChange={this.onSliderChange}
          items={this.props.images}
          itemValue={this.getImageIndex} />}
    </div>;
  }
}
