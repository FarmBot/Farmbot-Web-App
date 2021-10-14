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
  (image: TaggedImage) =>
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

export const imageInRange =
  (image: TaggedImage | undefined,
    imageFilterBegin: string | undefined,
    imageFilterEnd: string | undefined,
  ) => {
    if (!image) { return false; }
    const createdAt = moment(image.body.created_at);
    const afterBegin = !imageFilterBegin || createdAt.isAfter(imageFilterBegin);
    const beforeEnd = !imageFilterEnd || createdAt.isBefore(imageFilterEnd);
    return afterBegin && beforeEnd;
  };

export const imageIsHidden = (
  hiddenImages: number[],
  shownImages: number[],
  hideUnShownImages: boolean,
  imageId: number | undefined,
) =>
  imageId && (hiddenImages.includes(imageId)
    || (hideUnShownImages && !shownImages.includes(imageId)));

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

export const filterImagesByType = (designer: DesignerState) =>
  (img: TaggedImage | undefined) => {
    const {
      showPhotoImages, showCalibrationImages, showDetectionImages, showHeightImages,
    } = designer;
    return (showPhotoImages || !(getImageType(img) == ImageType.none))
      && (showCalibrationImages || !(getImageType(img) == ImageType.calibration))
      && (showDetectionImages || !(getImageType(img) == ImageType.detection))
      && (showHeightImages || !(getImageType(img) == ImageType.height));
  };

export const getImageShownStatusFlags =
  (props: GetImageShownStatusFlagsProps): ImageShowFlags => {
    const { image, designer, getConfigValue, env, size } = props;
    const { hiddenImages } = designer;
    const getFilterValue = parseFilterSetting(getConfigValue);
    return {
      layerOn: !!getConfigValue(BooleanSetting.show_images),
      inRange: !!imageInRange(image,
        getFilterValue(StringSetting.photo_filter_begin),
        getFilterValue(StringSetting.photo_filter_end)),
      notHidden: !imageIsHidden(hiddenImages, [], false, image?.body.id),
      zMatch: cameraZCheck(image?.body.meta.z,
        env["CAMERA_CALIBRATION_camera_z"]),
      sizeMatch: imageSizeCheck(size,
        getCalibratedImageCenter(env)),
      typeShown: filterImagesByType(designer)(image),
    };
  };
