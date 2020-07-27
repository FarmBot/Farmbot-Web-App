import * as React from "react";
import moment from "moment";
import { success, error } from "../../toast/toast";
import { ImageFlipper } from "./image_flipper";
import { PhotosProps, PhotoButtonsProps } from "./interfaces";
import { getDevice } from "../../device";
import { Content } from "../../constants";
import { safeStringFetch, timeFormatString } from "../../util";
import { destroy } from "../../api/crud";
import {
  downloadProgress,
} from "../../settings/fbos_settings/os_update_button";
import { TaggedImage } from "farmbot";
import { startCase, every } from "lodash";
import { MustBeOnline } from "../../devices/must_be_online";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";
import {
  cameraBtnProps,
} from "../../settings/fbos_settings/camera_selection";
import { Popover } from "@blueprintjs/core";
import { PhotoFilterSettings } from "./photo_filter_settings";
import {
  ImageShowMenu, ImageShowFlags, getImageShownStatusFlags,
} from "./shown_in_map";
import { highlightMapImage, setShownMapImages, selectImage } from "./actions";

interface MetaInfoProps {
  /** Default conversion is `attr_name ==> Attr Name`.
   *  Setting a label property will over ride it to a different value.
   */
  label?: string;
  attr: string;
  // tslint:disable-next-line:no-any
  obj: any; /** Really, it's OK here! See safeStringFetch */
}

function MetaInfo({ obj, attr, label }: MetaInfoProps) {
  const top = label || startCase(attr.split("_").join());
  const bottom = safeStringFetch(obj, attr);
  return <div className={"meta-info"}>
    <label>{top}:</label>
    <span>{bottom || t("unknown")}</span>
  </div>;
}

const PhotoMetaData = ({ image }: { image: TaggedImage | undefined }) =>
  <div className="image-metadata">
    {image
      ? Object.keys(image.body.meta)
        .filter(key => ["x", "y", "z"].includes(key))
        .sort()
        .map((key, index) =>
          <MetaInfo key={index} attr={key} obj={image.body.meta} />)
      : <MetaInfo
        label={t("Image")}
        attr={"image"}
        obj={{ image: t("No meta data.") }} />}
  </div>;

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

export interface PhotoFooterProps {
  image: TaggedImage | undefined;
  timeSettings: TimeSettings;
  dispatch: Function;
  flags: ImageShowFlags;
}

export const PhotoFooter = (props: PhotoFooterProps) => {
  const { image, timeSettings, dispatch, flags } = props;
  const created_at = image
    ? moment(image.body.created_at)
      .utcOffset(timeSettings.utcOffset)
      .format(`MMMM Do, YYYY ${timeFormatString(timeSettings)}`)
    : "";

  const shownInMap = every(Object.values(flags));
  return <div className="photos-footer">
    {/** Separated from <MetaInfo /> for stylistic purposes. */}
    {image ?
      <div className="image-created-at">
        <Popover popoverClassName={"image-filter-menu-popover"}>
          <i className={shownInMap
            ? "fa fa-eye green"
            : "fa fa-eye-slash gray"}
            onMouseEnter={() =>
              shownInMap && dispatch(highlightMapImage(image.body.id))}
            onMouseLeave={() =>
              shownInMap && dispatch(highlightMapImage(undefined))}
            title={shownInMap ? t("in map") : t("not in map")} />
          <ImageShowMenu dispatch={dispatch} flags={flags} image={image} />
        </Popover>
        <label>{t("Created At:")}</label>
        <span>
          {created_at}
        </span>
      </div>
      : ""}
    <PhotoMetaData image={image} />
  </div>;
};

interface PhotosState {
  imageWidth: number;
  imageHeight: number;
  crop: boolean;
  rotate: boolean;
}

export class Photos extends React.Component<PhotosProps, PhotosState> {
  state: PhotosState = {
    imageWidth: 0, imageHeight: 0, crop: true, rotate: true,
  };

  componentWillUnmount = () => this.props.dispatch(setShownMapImages(undefined));

  imageLoadCallback = (img: HTMLImageElement) => {
    const { naturalWidth, naturalHeight } = img;
    this.setState({ imageWidth: naturalWidth, imageHeight: naturalHeight });
  };

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

  get flags(): ImageShowFlags {
    return getImageShownStatusFlags({
      getConfigValue: this.props.getConfigValue,
      env: this.props.env,
      image: this.props.currentImage,
      hiddenImages: this.props.hiddenImages,
      size: {
        width: this.state.imageWidth,
        height: this.state.imageHeight,
      }
    });
  }

  onFlip = (uuid: string | undefined) => {
    this.props.dispatch(selectImage(uuid));
    this.props.dispatch(setShownMapImages(uuid));
  }

  render() {
    const canTransform = this.flags.sizeMatch && this.flags.zMatch;
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
        imageLoadCallback={this.imageLoadCallback}
        transformImage={canCrop}
        getConfigValue={this.props.getConfigValue}
        env={this.props.env}
        crop={this.state.crop}
        images={this.props.images} />
      <PhotoFooter
        image={this.props.currentImage}
        flags={this.flags}
        dispatch={this.props.dispatch}
        timeSettings={this.props.timeSettings} />
      <PhotoFilterSettings
        image={this.props.currentImage}
        images={this.props.images}
        flags={this.flags}
        dispatch={this.props.dispatch}
        hideUnShownImages={this.props.hideUnShownImages}
        alwaysHighlightImage={this.props.alwaysHighlightImage}
        getConfigValue={this.props.getConfigValue}
        timeSettings={this.props.timeSettings} />
    </div>;
  }
}
