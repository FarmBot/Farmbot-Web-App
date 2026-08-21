import moment from "moment";
import {
  BooleanConfigKey,
  StringConfigKey,
} from "farmbot/dist/resources/configs/web_app";
import { BooleanSetting, StringSetting } from "../../session_keys";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { TaggedImage } from "farmbot";
import { last } from "lodash";
import { UserEnv } from "../../devices/interfaces";
import {
  FlagValue,
  GetImageShownStatusFlagsProps, ImageShowFlags,
} from "../images/interfaces";
import {
  cameraZCheck, imageSizeCheck,
} from "../../farm_designer/map/layers/images/map_image";
import { DesignerState } from "../../farm_designer/interfaces";
import { t } from "../../i18next_wrapper";

export const IMAGE_LAYER_CONFIG_KEYS: (BooleanConfigKey | StringConfigKey)[] = [
  StringSetting.photo_filter_begin,
  StringSetting.photo_filter_end,
  BooleanSetting.crop_images,
  BooleanSetting.clip_image_layer,
  BooleanSetting.show_images,
];

export const parseFilterSetting = (getConfigValue: GetWebAppConfigValue) =>
  (setting: StringConfigKey): string | undefined => {
    const value = getConfigValue(setting);
    return value ? value.toString() : undefined;
  };

export const filterTime = (direction: "before" | "after", seconds = 1) =>
  (image: TaggedImage): string =>
    moment(image.body.created_at)
      .add(direction == "before" ? -seconds : seconds, "second")
      .toISOString();

export const calculateImageAgeInfo = (latestImages: TaggedImage[]) => {
  const newestImage = latestImages[0];
  const oldestImage = last(latestImages);
  const newestDate = newestImage ? newestImage.body.created_at : "";
  const toOldest = oldestImage && newestDate
    ? Math.abs(moment(oldestImage.body.created_at)
      .diff(moment(newestDate).clone(), "days"))
    : 1;
  return { newestDate, toOldest };
};

const format = (input: string | undefined): string =>
  JSON.stringify(input || "none").replace(/"/g, "");

export const imageInRange =
  (image: TaggedImage | undefined,
    imageFilterBegin: string | undefined,
    imageFilterEnd: string | undefined,
  ): FlagValue => {
    if (!image) { return { value: false, reason: "no image" }; }
    const createdAt = moment(image.body.created_at);
    const afterBegin = !imageFilterBegin || createdAt.isAfter(imageFilterBegin);
    const beforeEnd = !imageFilterEnd || createdAt.isBefore(imageFilterEnd);
    return {
      value: afterBegin && beforeEnd,
      reason: [
        createdAt.format(),
        `begin: ${format(imageFilterBegin)}`,
        `end: ${format(imageFilterEnd)}`,
        `afterBegin: ${afterBegin}`,
        `beforeEnd: ${beforeEnd}`,
      ].join("\n"),
    };
  };

export const notHidden = (
  hiddenImages: number[],
  shownImages: number[],
  hideUnShownImages: boolean,
  imageId: number | undefined,
): FlagValue => {
  const value = imageId && (hiddenImages.includes(imageId)
    || (hideUnShownImages && !shownImages.includes(imageId)));
  return {
    value: !value,
    reason: [
      imageId,
      `hidden: ${JSON.stringify(hiddenImages)}`,
      `shown: ${JSON.stringify(shownImages)}`,
    ].join("\n"),
  };
};

export const getCalibratedImageCenter = (env: UserEnv) => ({
  x: env["CAMERA_CALIBRATION_center_pixel_location_x"],
  y: env["CAMERA_CALIBRATION_center_pixel_location_y"],
});

enum ImageType {
  calibration = "calibration",
  detection = "detection",
  height = "height",
  none = "none",
}

/** For internal filtering. */
export const getImageType = (image: TaggedImage | undefined): ImageType => {
  const imageName = image?.body.meta.name || "";
  if (imageName.includes("calibration")) { return ImageType.calibration; }
  if (imageName.includes("marked")) { return ImageType.detection; }
  if (imageName.includes("map")) { return ImageType.height; }
  return ImageType.none;
};

/** For UI display. */
export const getImageTypeLabel = (image: TaggedImage | undefined): string => {
  switch (getImageType(image)) {
    case ImageType.calibration: return t("Calibration");
    case ImageType.detection: return t("Weed Detector");
    case ImageType.height: return t("Soil Height");
    case ImageType.none: return t("Photo");
  }
};

type ImageTypeVisibility = Pick<DesignerState,
  "showPhotoImages" | "showCalibrationImages"
  | "showDetectionImages" | "showHeightImages">;

export const filterImagesByType = (designer: ImageTypeVisibility) =>
  (img: TaggedImage | undefined): FlagValue => {
    const {
      showPhotoImages, showCalibrationImages, showDetectionImages, showHeightImages,
    } = designer;
    const value = (showPhotoImages || !(getImageType(img) == ImageType.none))
      && (showCalibrationImages || !(getImageType(img) == ImageType.calibration))
      && (showDetectionImages || !(getImageType(img) == ImageType.detection))
      && (showHeightImages || !(getImageType(img) == ImageType.height));
    const imgTypeRaw = getImageType(img);
    const imgType = imgTypeRaw == ImageType.none ? "photo" : imgTypeRaw;
    return {
      value: value,
      reason: [
        `${img?.body.meta.name}: ${imgType}`,
        `showPhotoImages: ${showPhotoImages}`,
        `showCalibrationImages: ${showCalibrationImages}`,
        `showDetectionImages: ${showDetectionImages}`,
        `showHeightImages: ${showHeightImages}`,
      ].join("\n"),
    };
  };

const layerOn = (getConfigValue: GetWebAppConfigValue): FlagValue => {
  const value = !!getConfigValue(BooleanSetting.show_images);
  return {
    value: value,
    reason: `show_images: ${value}`,
  };
};

const zMatch = (image: TaggedImage | undefined, env: UserEnv): FlagValue => {
  const value = cameraZCheck(image?.body.meta.z, env["CAMERA_CALIBRATION_camera_z"]);
  return {
    value: value,
    reason: [
      `image z: ${image?.body.meta.z}`,
      `calibration z: ${format(env["CAMERA_CALIBRATION_camera_z"])}`,
    ].join("\n"),
  };
};

const sizeMatch = (
  size: Record<"width" | "height", number | undefined>,
  env: UserEnv,
): FlagValue => {
  const calibCenter = getCalibratedImageCenter(env);
  const x = parseInt("" + calibCenter.x);
  const y = parseInt("" + calibCenter.y);
  const calibSize = {
    width: x ? x * 2 : undefined,
    height: y ? y * 2 : undefined,
  };
  const value = imageSizeCheck(size, calibCenter);
  return {
    value: value,
    reason: [
      `image size: ${JSON.stringify(size)}`,
      `calibration size: ${JSON.stringify(calibSize)}`,
    ].join("\n"),
  };
};

export const getImageShownStatusFlags =
  (props: GetImageShownStatusFlagsProps): ImageShowFlags => {
    const { image, designer, getConfigValue, env, size } = props;
    const { hiddenImages } = designer;
    const getFilterValue = parseFilterSetting(getConfigValue);
    return {
      layerOn: layerOn(getConfigValue),
      inRange: imageInRange(image,
        getFilterValue(StringSetting.photo_filter_begin),
        getFilterValue(StringSetting.photo_filter_end)),
      notHidden: notHidden(hiddenImages, [], false, image?.body.id),
      zMatch: zMatch(image, env),
      sizeMatch: sizeMatch(size, env),
      typeShown: filterImagesByType(designer)(image),
    };
  };
