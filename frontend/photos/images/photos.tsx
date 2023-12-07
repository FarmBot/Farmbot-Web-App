import React from "react";
import moment from "moment";
import { success, error } from "../../toast/toast";
import {
  getIndexOfUuid, getNextIndexes, ImageFlipper, selectNextImage,
} from "./image_flipper";
import {
  PhotosProps, PhotoButtonsProps, PhotoFooterProps, PhotosComponentState,
  MoveToLocationProps,
  NewPhotoButtonsProps,
} from "./interfaces";
import { formatTime } from "../../util";
import { destroy } from "../../api/crud";
import { downloadProgress } from "../../settings/fbos_settings/os_update_button";
import { isNumber, isUndefined, round } from "lodash";
import { isBotOnline, MustBeOnline } from "../../devices/must_be_online";
import { t } from "../../i18next_wrapper";
import { cameraBtnProps } from "../capture_settings/camera_selection";
import { Overlay } from "@blueprintjs/core";
import { ImageShowMenu, ImageShowMenuTarget } from "./image_show_menu";
import { setShownMapImages } from "./actions";
import { TaggedImage } from "farmbot";
import { MarkedSlider, Popover } from "../../ui";
import { takePhoto } from "../../devices/actions";
import {
  botPositionLabel,
} from "../../farm_designer/map/layers/farmbot/bot_position_label";
import {
  GoToThisLocationButton, validGoButtonAxes,
} from "../../farm_designer/move_to";

const NewPhotoButtons = (props: NewPhotoButtonsProps) => {
  const imageUploadJobProgress = downloadProgress(props.imageJobs[0]);
  const { syncStatus, botToMqttStatus } = props;
  const botOnline = isBotOnline(syncStatus, botToMqttStatus);
  const camDisabled = cameraBtnProps(props.env, botOnline);
  return <div className={"new-photo-button"}>
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
    <p>
      {imageUploadJobProgress &&
        `${t("uploading photo")}...${imageUploadJobProgress}`}
    </p>
  </div>;
};

export const PhotoButtons = (props: PhotoButtonsProps) => {
  const { imageUrl } = props;
  const { image, dispatch, flags, size } = props;
  const imageShowMenuProps = { dispatch, flags, image, size };
  return <div className={"photo-action-buttons"}>
    {flags && image &&
      <Popover className={"image-show-menu-target"}
        popoverClassName={"image-show-menu-popover"}
        target={<ImageShowMenuTarget {...imageShowMenuProps} flags={flags} />}
        content={<ImageShowMenu {...imageShowMenuProps} flags={flags} />} />}
    {imageUrl && <i className={"fa fa-trash fb-icon-button"}
      title={t("Delete Photo")}
      onClick={props.deletePhoto} />}
    {imageUrl && <a
      title={t("Download Photo")}
      href={props.imageUrl}
      target={"_blank"}
      rel={"noreferrer"}
      download={true}>
      <i className={"fa fa-download fb-icon-button"} />
    </a>}
    {imageUrl &&
      <i title={t("Toggle crop")}
        className={[
          "fa fa-scissors",
          props.canCrop ? "" : "disabled",
          "fb-icon-button",
        ].join(" ")}
        onClick={props.canCrop ? props.toggleCrop : undefined} />}
    {imageUrl &&
      <i title={t("Toggle rotation")}
        className={[
          "fa fa-repeat",
          props.canTransform ? "" : "disabled",
          "fb-icon-button",
        ].join(" ")}
        onClick={props.canTransform ? props.toggleRotation : undefined} />}
    <i className={"fa fa-arrows-alt desktop-only fb-icon-button"}
      title={t("View fullscreen")}
      onClick={props.toggleFullscreen} />
  </div>;
};

export const PhotoFooter = (props: PhotoFooterProps) => {
  const { image, timeSettings } = props;
  const created_at = image
    ? formatTime(moment(image.body.created_at), timeSettings, "MMMM Do, YYYY")
    : "";
  return <div className="photos-footer">
    <div className={"gradient"} />
    <div className={"footer-text"}>
      <div className={"image-metadata"}>
        {image && <Popover
          target={<p>{botPositionLabel(image.body.meta)}</p>}
          content={<MoveToLocation
            imageLocation={image.body.meta}
            dispatch={props.dispatch}
            arduinoBusy={props.arduinoBusy}
            defaultAxes={props.defaultAxes}
            currentBotLocation={props.currentBotLocation}
            movementState={props.movementState}
            botOnline={props.botOnline} />} />}
        {!isUndefined(props.distance) &&
          <div className={"meta-info"}>
            <label>{t("Distance")}:</label>
            <span>{round(props.distance)}</span>
          </div>}
      </div>
      <div className={"image-created-at"}>
        <span>{created_at}</span>
      </div>
    </div>
    {props.children}
  </div>;
};

export const MoveToLocation = (props: MoveToLocationProps) => {
  const { x, y, z } = props.imageLocation;
  if (!isNumber(x) || !isNumber(y) || !isNumber(z)) { return <div />; }
  return <GoToThisLocationButton
    dispatch={props.dispatch}
    locationCoordinate={{ x, y, z }}
    botOnline={props.botOnline}
    arduinoBusy={props.arduinoBusy}
    currentBotLocation={props.currentBotLocation}
    movementState={props.movementState}
    defaultAxes={props.defaultAxes} />;
};

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
      autoFocus={true}
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
      <NewPhotoButtons
        syncStatus={this.props.syncStatus}
        botToMqttStatus={this.props.botToMqttStatus}
        takePhoto={takePhoto}
        env={this.props.env}
        imageJobs={this.props.imageJobs} />
      <Overlay isOpen={this.state.fullscreen}
        onClose={this.toggleFullscreen}
        backdropProps={{ style: { background: "#000d" } }}>
        <this.ImageFlipper id={"fullscreen-flipper"} />
      </Overlay>
      <this.ImageFlipper id={"panel-flipper"} />
      <PhotoFooter
        image={this.props.currentImage}
        botOnline={isBotOnline(this.props.syncStatus, this.props.botToMqttStatus)}
        dispatch={this.props.dispatch}
        arduinoBusy={this.props.arduinoBusy}
        defaultAxes={validGoButtonAxes(this.props.getConfigValue)}
        currentBotLocation={this.props.currentBotLocation}
        movementState={this.props.movementState}
        timeSettings={this.props.timeSettings}>
        <PhotoButtons
          deletePhoto={this.deletePhoto}
          toggleCrop={this.toggleCrop}
          toggleRotation={this.toggleRotation}
          toggleFullscreen={this.toggleFullscreen}
          imageUrl={this.props.currentImage?.body.attachment_url}
          image={this.props.currentImage}
          flags={this.props.flags}
          size={this.props.currentImageSize}
          dispatch={this.props.dispatch}
          canTransform={this.canTransform}
          canCrop={this.canCrop} />
      </PhotoFooter>
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
