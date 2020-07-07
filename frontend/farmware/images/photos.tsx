import * as React from "react";
import moment from "moment";
import { success, error } from "../../toast/toast";
import { ImageFlipper } from "./image_flipper";
import { PhotosProps, PhotoButtonsProps } from "./interfaces";
import { getDevice } from "../../device";
import { Content, Actions, ToolTips } from "../../constants";
import { selectImage } from "./actions";
import { safeStringFetch, timeFormatString, semverCompare, SemverResult } from "../../util";
import { destroy } from "../../api/crud";
import {
  downloadProgress,
} from "../../devices/components/fbos_settings/os_update_button";
import { TaggedImage } from "farmbot";
import { startCase, every } from "lodash";
import { MustBeOnline } from "../../devices/must_be_online";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";
import {
  cameraBtnProps, CameraSelection,
} from "../../devices/components/fbos_settings/camera_selection";
import { Popover } from "@blueprintjs/core";
import {
  imageInRange, isHidden,
} from "../../farm_designer/map/layers/images/image_layer";
import {
  setWebAppConfigValues,
} from "../../farm_designer/map/layers/images/image_filter_menu";
import {
  cameraZCheck, cameraOrientationCheck, isRotated,
} from "../../farm_designer/map/layers/images/map_image";
import { UserEnv, ShouldDisplay } from "../../devices/interfaces";
import { ToggleButton } from "../../controls/toggle_button";
import { SaveFarmwareEnv } from "../interfaces";
import { Help } from "../../ui";

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
      {t("Delete Photo")}
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
  imageFilterBegin: string | undefined;
  imageFilterEnd: string | undefined;
  hiddenImages: number[];
  env: UserEnv;
  imageSize: Record<"width" | "height", number>;
}

type FlagKey = "inRange" | "notHidden" | "zMatch" | "sizeMatch";
type ImageShowFlags = Record<FlagKey, boolean>;

export const getCalibratedImageCenter = (env: UserEnv) => ({
  x: env["CAMERA_CALIBRATION_center_pixel_location_x"],
  y: env["CAMERA_CALIBRATION_center_pixel_location_y"],
});

export const PhotoFooter = (props: PhotoFooterProps) => {
  const {
    image, timeSettings, dispatch, imageFilterBegin, imageFilterEnd,
  } = props;
  const created_at = image
    ? moment(image.body.created_at)
      .utcOffset(timeSettings.utcOffset)
      .format(`MMMM Do, YYYY ${timeFormatString(timeSettings)}`)
    : "";
  const flags: ImageShowFlags = {
    inRange: !!imageInRange(imageFilterBegin, imageFilterEnd)(image),
    notHidden: !isHidden(props.hiddenImages, image?.body.id),
    zMatch: cameraZCheck(image?.body.meta.z,
      props.env["CAMERA_CALIBRATION_camera_z"]),
    sizeMatch: cameraOrientationCheck(props.imageSize,
      getCalibratedImageCenter(props.env),
      !!isRotated(image?.body.meta.name,
        !props.env["CAMERA_CALIBRATION_coord_scale"]))
  };
  const shownInMap = every(Object.values(flags));
  return <div className="photos-footer">
    {/** Separated from <MetaInfo /> for stylistic purposes. */}
    {image ?
      <div className="image-created-at">
        <Popover popoverClassName={"image-filter-menu-popover"}>
          <i className={shownInMap
            ? "fa fa-check-circle green"
            : "fa fa-times-circle gray"}
            onMouseEnter={() =>
              shownInMap && dispatch(highlightMapImage(image.body.id))}
            onMouseLeave={() =>
              shownInMap && dispatch(highlightMapImage(undefined))}
            title={shownInMap ? t("in map") : t("not in map")} />
          <ImageMetaFilterMenu dispatch={dispatch} flags={flags} image={image} />
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

interface FlagDisplayRowProps {
  flag: boolean;
  labelOk: string;
  labelNo: string;
}

const FlagDisplayRow = (props: FlagDisplayRowProps) =>
  <div className={"image-flag-display"}>
    {props.flag
      ? <i className={"fa fa-check-circle green"} />
      : <i className={"fa fa-times-circle gray"} />}
    <p>{props.flag ? t(props.labelOk) : t(props.labelNo)}</p>
  </div>;

const highlightMapImage = (imageId: number | undefined) => ({
  type: Actions.HIGHLIGHT_MAP_IMAGE,
  payload: imageId,
});

export interface ImageFilterProps {
  image: TaggedImage;
  dispatch: Function;
  flags: ImageShowFlags;
}

const filterTime = (direction: "before" | "after") => (image: TaggedImage) =>
  moment(image.body.created_at)
    .add(direction == "before" ? -1 : 1, "second")
    .toISOString();

export const ImageMetaFilterMenu = (props: ImageFilterProps) =>
  <div className={"image-meta-filter-menu"}>
    <ShownInMapDetails {...props} />
    <FilterThisImage {...props} />
    <hr />
    <FilterOlderOrNewer {...props} />
    <hr />
    <HideImage {...props} />
  </div>;

const ShownInMapDetails = ({ dispatch, image, flags }: ImageFilterProps) => {
  const shownInMap = every(Object.values(flags));
  return <div className={`shown-in-map-details ${shownInMap ? "shown" : ""}`}
    onMouseEnter={() => shownInMap && dispatch(highlightMapImage(image.body.id))}
    onMouseLeave={() => shownInMap && dispatch(highlightMapImage(undefined))}>
    <label>
      {shownInMap
        ? t("shown in map")
        : t("not shown in map")}
    </label>
    <FlagDisplayRow flag={flags.inRange}
      labelOk={t("Within filter range")}
      labelNo={t("Outside of filter range")} />
    <FlagDisplayRow flag={flags.zMatch}
      labelOk={t("Z height matches calibration")}
      labelNo={t("Z doesn't match calibration")} />
    <FlagDisplayRow flag={flags.sizeMatch}
      labelOk={t("Size matches camera calibration")}
      labelNo={t("Size doesn't match calibration")} />
    <FlagDisplayRow flag={flags.notHidden}
      labelOk={t("Not hidden")}
      labelNo={t("Temporarily hidden")} />
  </div>;
};

const FilterThisImage = ({ dispatch, image, flags }: ImageFilterProps) =>
  <div className={"this-image-section"}>
    <div className={"content"}>
      <p>{t("show only")}</p>
      <button
        className={"fb-button yellow"}
        disabled={!(flags.zMatch && flags.notHidden)}
        title={t("this image")}
        onClick={() => dispatch(setWebAppConfigValues({
          photo_filter_begin: filterTime("before")(image),
          photo_filter_end: filterTime("after")(image),
        }))}>
        {t("this image")}
      </button>
      <p>{t("in map")}</p>
    </div>
  </div>;

const FilterOlderOrNewer = ({ dispatch, image, flags }: ImageFilterProps) =>
  <div className={"newer-older-images-section"}>
    <p>{t("show only this image and")}</p>
    <div className={"buttons"}>
      <button
        className={"fb-button yellow"}
        disabled={!(flags.zMatch && flags.notHidden)}
        title={t("older")}
        onClick={() => dispatch(setWebAppConfigValues({
          photo_filter_begin: "", photo_filter_end: filterTime("after")(image),
        }))}>
        <i className="fa fa-arrow-left" />
        {t("older")}
      </button>
      <button
        className={"fb-button yellow"}
        disabled={!(flags.zMatch && flags.notHidden)}
        title={t("newer")}
        onClick={() => dispatch(setWebAppConfigValues({
          photo_filter_begin: filterTime("before")(image), photo_filter_end: "",
        }))}>
        {t("newer")}
        <i className="fa fa-arrow-right" />
      </button>
    </div>
    <p>{t("images in map")}</p>
  </div>;

const HideImage =
  ({ flags, image, dispatch }: ImageFilterProps) =>
    <div className={"hide-single-image-section"}>
      <div className={"content"}>
        <p className={"header-label"}>{t("temporarily")}</p>
        <button
          className={"fb-button yellow"}
          disabled={!(flags.zMatch && flags.inRange)}
          title={flags.notHidden ? t("hide") : t("show")}
          onClick={() => image.body.id && dispatch({
            type: flags.notHidden
              ? Actions.HIDE_MAP_IMAGE
              : Actions.SHOW_MAP_IMAGE,
            payload: image.body.id,
          })}>
          {flags.notHidden ? t("hide") : t("show")}
        </button>
        <p>
          {flags.notHidden
            ? t("this image from map")
            : t("this image in map")}
        </p>
      </div>
    </div>;

interface PhotosState {
  imageWidth: number;
  imageHeight: number;
}

export class Photos extends React.Component<PhotosProps, PhotosState> {
  state: PhotosState = { imageWidth: 0, imageHeight: 0 };

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

  render() {
    return <div className="photos">
      <PhotoButtons
        syncStatus={this.props.syncStatus}
        botToMqttStatus={this.props.botToMqttStatus}
        takePhoto={this.takePhoto}
        deletePhoto={this.deletePhoto}
        env={this.props.env}
        imageJobs={this.props.imageJobs} />
      <ImageFlipper
        onFlip={id => this.props.dispatch(selectImage(id))}
        currentImage={this.props.currentImage}
        imageLoadCallback={this.imageLoadCallback}
        images={this.props.images} />
      <PhotoFooter
        image={this.props.currentImage}
        imageSize={{
          width: this.state.imageWidth,
          height: this.state.imageHeight,
        }}
        imageFilterBegin={this.props.imageFilterBegin}
        imageFilterEnd={this.props.imageFilterEnd}
        hiddenImages={this.props.hiddenImages}
        env={this.props.env}
        dispatch={this.props.dispatch}
        timeSettings={this.props.timeSettings} />
    </div>;
  }
}

export interface PhotosSettingsProps {
  env: UserEnv;
  saveFarmwareEnv: SaveFarmwareEnv;
  shouldDisplay: ShouldDisplay;
  botOnline: boolean;
  dispatch: Function;
  version: string;
}

export const DISABLE_ROTATE_AT_CAPTURE_KEY =
  "take_photo_disable_rotation_adjustment";

export const PhotosSettings = (props: PhotosSettingsProps) => {
  const disableRotation =
    props.env[DISABLE_ROTATE_AT_CAPTURE_KEY]?.includes("1");
  return <div className="photos-settings">
    <CameraSelection
      dispatch={props.dispatch}
      noLabel={true}
      env={props.env}
      botOnline={props.botOnline}
      saveFarmwareEnv={props.saveFarmwareEnv}
      shouldDisplay={props.shouldDisplay} />
    {semverCompare(props.version, "1.0.13") == SemverResult.LEFT_IS_GREATER &&
      <div className={"capture-rotate-setting"}>
        <label>{t("Adjust rotation during capture")}</label>
        <Help text={ToolTips.ROTATE_IMAGE_AT_CAPTURE} />
        <ToggleButton toggleValue={!disableRotation}
          toggleAction={() => props.dispatch(props.saveFarmwareEnv(
            DISABLE_ROTATE_AT_CAPTURE_KEY,
            disableRotation ? "0" : "1"))} />
      </div>}
  </div>;
};
