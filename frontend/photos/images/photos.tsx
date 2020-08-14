import React from "react";
import moment from "moment";
import { success, error } from "../../toast/toast";
import { ImageFlipper } from "./image_flipper";
import {
  PhotosProps, PhotoButtonsProps, PhotoFooterProps, PhotosState,
} from "./interfaces";
import { getDevice } from "../../device";
import { Content } from "../../constants";
import { timeFormatString } from "../../util";
import { destroy } from "../../api/crud";
import { downloadProgress } from "../../settings/fbos_settings/os_update_button";
import { startCase } from "lodash";
import { MustBeOnline } from "../../devices/must_be_online";
import { t } from "../../i18next_wrapper";
import { cameraBtnProps } from "../../settings/fbos_settings/camera_selection";
import { Popover } from "@blueprintjs/core";
import { ImageShowMenu, ImageShowMenuTarget } from "./image_show_menu";
import { setShownMapImages, selectImage } from "./actions";
import { Xyz } from "farmbot";

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

export class Photos extends React.Component<PhotosProps, PhotosState> {
  state: PhotosState = {
    crop: true, rotate: true,
  };

  componentWillUnmount = () => this.props.dispatch(setShownMapImages(undefined));

  takePhoto = () => {
    const ok = () => success(t(Content.PROCESSING_PHOTO));
    const no = () => error(t("Error taking photo"));
    getDevice().takePhoto().then(ok, no);
  }

  deletePhoto = () => {
    const img = this.props.currentImage || this.props.images[0];
    if (img?.uuid) {
      this.props.dispatch(destroy(img.uuid))
        .then(() => success(t("Image Deleted.")))
        .catch(() => error(t("Could not delete image.")));
    }
  }

  toggleCrop = () => this.setState({ crop: !this.state.crop });
  toggleRotation = () => this.setState({ rotate: !this.state.rotate });

  onFlip = (uuid: string | undefined) => {
    this.props.dispatch(selectImage(uuid));
    this.props.dispatch(setShownMapImages(uuid));
  }

  render() {
    const canTransform = this.props.flags.sizeMatch && this.props.flags.zMatch;
    const canCrop = canTransform && this.state.rotate;
    return <div className="photos">
      <PhotoButtons
        syncStatus={this.props.syncStatus}
        botToMqttStatus={this.props.botToMqttStatus}
        takePhoto={this.takePhoto}
        deletePhoto={this.deletePhoto}
        toggleCrop={this.toggleCrop}
        toggleRotation={this.toggleRotation}
        imageUrl={this.props.currentImage?.body.attachment_url}
        canTransform={canTransform}
        canCrop={canCrop}
        env={this.props.env}
        imageJobs={this.props.imageJobs} />
      <ImageFlipper
        onFlip={this.onFlip}
        currentImage={this.props.currentImage}
        dispatch={this.props.dispatch}
        currentImageSize={this.props.currentImageSize}
        transformImage={canCrop}
        getConfigValue={this.props.getConfigValue}
        env={this.props.env}
        crop={this.state.crop}
        images={this.props.images} />
      <PhotoFooter
        image={this.props.currentImage}
        flags={this.props.flags}
        size={this.props.currentImageSize}
        dispatch={this.props.dispatch}
        timeSettings={this.props.timeSettings} />
    </div>;
  }
}
