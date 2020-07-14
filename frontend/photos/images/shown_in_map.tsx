import * as React from "react";
import { TaggedImage } from "farmbot";
import { every } from "lodash";
import { t } from "../../i18next_wrapper";
import {
  cameraZCheck, imageSizeCheck,
} from "../../farm_designer/map/layers/images/map_image";
import { UserEnv } from "../../devices/interfaces";
import { BooleanSetting } from "../../session_keys";
import { parseFilterSetting } from "./photo_filter_settings";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { highlightMapImage, toggleHideImage } from "./actions";
import moment from "moment";

type FlagKey = "layerOn" | "inRange" | "notHidden" | "zMatch" | "sizeMatch";
export type ImageShowFlags = Record<FlagKey, boolean>;

export interface GetImageShownStatusFlagsProps {
  image: TaggedImage | undefined;
  hiddenImages: number[];
  getConfigValue: GetWebAppConfigValue;
  env: UserEnv;
  size: Record<"width" | "height", number>;
}

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

export const getCalibratedImageCenter = (env: UserEnv) => ({
  x: env["CAMERA_CALIBRATION_center_pixel_location_x"],
  y: env["CAMERA_CALIBRATION_center_pixel_location_y"],
});

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

export interface ImageFilterProps {
  image: TaggedImage | undefined;
  dispatch: Function;
  flags: ImageShowFlags;
}

export const ImageShowMenu = (props: ImageFilterProps) =>
  <div className={"image-meta-filter-menu"}>
    <ShownInMapDetails {...props} />
    <HideImage {...props} />
  </div>;

const ShownInMapDetails = ({ dispatch, image, flags }: ImageFilterProps) => {
  const shownInMap = every(Object.values(flags));
  return <div className={`shown-in-map-details ${shownInMap ? "shown" : ""}`}
    onMouseEnter={() => shownInMap && dispatch(highlightMapImage(image?.body.id))}
    onMouseLeave={() => shownInMap && dispatch(highlightMapImage(undefined))}>
    <label>
      {shownInMap
        ? t("shown in map")
        : t("not shown in map")}
    </label>
    <FlagDisplayRow flag={flags.layerOn}
      labelOk={t("Map photo layer on")}
      labelNo={t("Map photo layer off")} />
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

const HideImage =
  ({ flags, image, dispatch }: ImageFilterProps) =>
    <div className={"hide-single-image-section"}>
      <div className={"content"}>
        <button
          className={"fb-button yellow"}
          disabled={!(flags.zMatch && flags.inRange)}
          title={flags.notHidden ? t("hide") : t("show")}
          onClick={() => image?.body.id
            && dispatch(toggleHideImage(flags.notHidden, image.body.id))}>
          {flags.notHidden ? t("hide") : t("show")}
        </button>
        <p>
          {flags.notHidden
            ? t("this photo from map")
            : t("this photo in map")}
        </p>
        <p className={"header-label"}>{t("(resets upon refresh)")}</p>
      </div>
    </div>;

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
