import React from "react";
import { t } from "../../i18next_wrapper";
import { ImageFilterMenu } from "./image_filter_menu";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { BooleanSetting, StringSetting } from "../../session_keys";
import {
  toggleAlwaysHighlightImage, toggleSingleImageMode, setWebAppConfigValues,
  toggleShowPhotoImages,
  toggleShowCalibrationImages,
  toggleShowDetectionImages,
  toggleShowHeightImages,
} from "./actions";
import {
  IMAGE_LAYER_CONFIG_KEYS, calculateImageAgeInfo, parseFilterSetting,
} from "./util";
import { FilterNearTime } from "./filter_near_time";
import {
  PhotoFilterSettingsProps, FiltersEnabledWarningProps,
} from "./interfaces";
import { FilterOlderOrNewer } from "./filter_older_or_newer";
import { Help, ToggleButton } from "../../ui";
import {
  getModifiedClassName, getModifiedClassNameDefaultFalse,
} from "../../settings/default_values";

export const PhotoFilterSettings = (props: PhotoFilterSettingsProps) => {
  const { dispatch, flags } = props;
  const {
    alwaysHighlightImage, hideUnShownImages,
    showCalibrationImages, showDetectionImages, showHeightImages,
    showPhotoImages,
  } = props.designer;
  const layerOff = !flags.layerOn;
  const image = props.currentImage;
  const commonProps = { dispatch, image, flags };
  const className = [
    "filter-controls",
    hideUnShownImages ? "single-image-mode" : "",
    layerOff ? "image-layer-disabled" : "",
  ].join(" ");
  const clearFilters = () => dispatch(setWebAppConfigValues({
    photo_filter_begin: "", photo_filter_end: "",
  }));
  return <div className={"photo-filter-settings"}>
    <div className={className}>
      <p className={"banner"}>
        {layerOff
          ? t("Map photo layer off")
          : t("Single photo mode active")}
      </p>
      <button className="fb-button red" onClick={clearFilters}>
        {t("Reset filters")}
      </button>
      <ImageFilterMenu
        key={JSON.stringify(IMAGE_LAYER_CONFIG_KEYS
          .map(key => props.getConfigValue(key)))}
        dispatch={dispatch}
        getConfigValue={props.getConfigValue}
        timeSettings={props.timeSettings}
        images={props.images}
        imageAgeInfo={calculateImageAgeInfo(props.images)} />
      <FilterNearTime {...commonProps} />
      <FilterOlderOrNewer {...commonProps} />
    </div>
    <div className={"toggle-group"}>
      <label className={"toggle-label"}>{t("show photos in map")}</label>
      <ToggleButton toggleValue={!layerOff}
        className={getModifiedClassName(BooleanSetting.show_images)}
        toggleAction={() =>
          dispatch(setWebAppConfigValue(BooleanSetting.show_images, layerOff))} />
    </div>
    <div className={"toggle-group"}>
      <label className={"toggle-label"}>
        {t("always highlight current photo in map")}
      </label>
      <ToggleButton disabled={layerOff}
        className={getModifiedClassNameDefaultFalse(alwaysHighlightImage)}
        toggleValue={alwaysHighlightImage}
        toggleAction={() =>
          dispatch(toggleAlwaysHighlightImage(alwaysHighlightImage, image))} />
    </div>
    <div className={"toggle-group"}>
      <label className="toggle-label">
        {t("only show current photo in map")}
      </label>
      <ToggleButton disabled={layerOff}
        className={getModifiedClassNameDefaultFalse(hideUnShownImages)}
        toggleValue={hideUnShownImages}
        toggleAction={() => dispatch(toggleSingleImageMode(image))} />
    </div>
    <div className={"toggle-group"}>
      <label className={"toggle-label"}>
        {t("show take photo images")}
      </label>
      <ToggleButton disabled={layerOff}
        className={getModifiedClassNameDefaultFalse(!showPhotoImages)}
        toggleValue={showPhotoImages}
        toggleAction={toggleShowPhotoImages(dispatch)} />
    </div>
    <div className={"toggle-group"}>
      <label className={"toggle-label"}>
        {t("show calibration images")}
      </label>
      <ToggleButton disabled={layerOff}
        className={getModifiedClassNameDefaultFalse(!showCalibrationImages)}
        toggleValue={showCalibrationImages}
        toggleAction={toggleShowCalibrationImages(dispatch)} />
    </div>
    <div className={"toggle-group"}>
      <label className={"toggle-label"}>
        {t("show weed detector images")}
      </label>
      <ToggleButton disabled={layerOff}
        className={getModifiedClassNameDefaultFalse(!showDetectionImages)}
        toggleValue={showDetectionImages}
        toggleAction={toggleShowDetectionImages(dispatch)} />
    </div>
    <div className={"toggle-group"}>
      <label className={"toggle-label"}>
        {t("show soil height images")}
      </label>
      <ToggleButton disabled={layerOff}
        className={getModifiedClassNameDefaultFalse(!showHeightImages)}
        toggleValue={showHeightImages}
        toggleAction={toggleShowHeightImages(dispatch)} />
    </div>
  </div>;
};

export const FiltersEnabledWarning = (props: FiltersEnabledWarningProps) => {
  const { getConfigValue } = props;
  const {
    hideUnShownImages,
    showPhotoImages, showCalibrationImages, showDetectionImages, showHeightImages,
  } = props.designer;
  const filtersEnabled =
    !!parseFilterSetting(getConfigValue)(StringSetting.photo_filter_begin)
    || !!parseFilterSetting(getConfigValue)(StringSetting.photo_filter_end)
    || hideUnShownImages
    || !showPhotoImages
    || !showCalibrationImages || !showDetectionImages || !showHeightImages
    || !getConfigValue(BooleanSetting.show_images);
  return filtersEnabled
    ? <div className={"filters-enabled-warning"}
      title={t("Map filters enabled.")}
      onClick={e => e.stopPropagation()}>
      <Help text={t("Map filters enabled.")}
        customIcon={"exclamation-triangle"} />
    </div>
    : <div className={"filters-enabled-warning"} />;
};
