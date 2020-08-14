import moment from "moment";
import {
  BooleanConfigKey,
  StringConfigKey,
} from "farmbot/dist/resources/configs/web_app";
import { BooleanSetting } from "../../session_keys";
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

export const IMAGE_LAYER_CONFIG_KEYS: (BooleanConfigKey | StringConfigKey)[] = [
  "photo_filter_begin",
  "photo_filter_end",
  BooleanSetting.crop_images,
  BooleanSetting.show_images,
];

export const parseFilterSetting = (getConfigValue: GetWebAppConfigValue) =>
  (setting: "photo_filter_begin" | "photo_filter_end"): string | undefined => {
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

export const getImageShownStatusFlags =
  (props: GetImageShownStatusFlagsProps): ImageShowFlags => {
    const { image, hiddenImages, getConfigValue, env, size } = props;
    const getFilterValue = parseFilterSetting(getConfigValue);
    return {
      layerOn: !!getConfigValue(BooleanSetting.show_images),
      inRange: !!imageInRange(image,
        getFilterValue("photo_filter_begin"),
        getFilterValue("photo_filter_end")),
      notHidden: !imageIsHidden(hiddenImages, [], false, image?.body.id),
      zMatch: cameraZCheck(image?.body.meta.z,
        env["CAMERA_CALIBRATION_camera_z"]),
      sizeMatch: imageSizeCheck(size,
        getCalibratedImageCenter(env))
    };
  };
