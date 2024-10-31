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
import { Highlight } from "../../settings/maybe_highlight";
import { DeviceSetting } from "../../constants";
import { Path } from "../../internal_urls";

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
  const commonToggleProps = { dispatch, layerOff };
  return <div className={"photo-filter-settings grid"}>
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
    <Highlight settingName={DeviceSetting.showPhotos} pathPrefix={Path.photos}>
      <div className={"row grid-exp-1"}>
        <label className={"toggle-label"}>{t("show photos in map")}</label>
        <ToggleButton toggleValue={!layerOff}
          className={getModifiedClassName(BooleanSetting.show_images)}
          toggleAction={() =>
            dispatch(setWebAppConfigValue(BooleanSetting.show_images, layerOff))} />
      </div>
    </Highlight>
    <PhotoSettingToggle {...commonToggleProps}
      settingName={DeviceSetting.alwaysHighlightCurrentPhotoInMap}
      toggle={toggleAlwaysHighlightImage(alwaysHighlightImage, image)}
      truthyDefault={true}
      value={alwaysHighlightImage} />
    <PhotoSettingToggle {...commonToggleProps}
      settingName={DeviceSetting.onlyShowCurrentPhotoInMap}
      toggle={toggleSingleImageMode(image)}
      truthyDefault={true}
      value={hideUnShownImages} />
    <PhotoSettingToggle {...commonToggleProps}
      settingName={DeviceSetting.showTakePhotoImages}
      toggle={toggleShowPhotoImages}
      value={showPhotoImages} />
    <PhotoSettingToggle {...commonToggleProps}
      settingName={DeviceSetting.showCalibrationImages}
      toggle={toggleShowCalibrationImages}
      value={showCalibrationImages} />
    <PhotoSettingToggle {...commonToggleProps}
      settingName={DeviceSetting.showWeedDetectorImages}
      toggle={toggleShowDetectionImages}
      value={showDetectionImages} />
    <PhotoSettingToggle {...commonToggleProps}
      settingName={DeviceSetting.showSoilHeightImages}
      toggle={toggleShowHeightImages}
      value={showHeightImages} />
  </div>;
};

interface PhotoSettingToggleProps {
  settingName: DeviceSetting;
  layerOff: boolean;
  dispatch: Function;
  value: boolean;
  truthyDefault?: boolean;
  toggle(dispatch: Function): () => void;
}

const PhotoSettingToggle = (props: PhotoSettingToggleProps) =>
  <Highlight settingName={props.settingName}
    pathPrefix={Path.photos}>
    <div className={"row grid-exp-1"}>
      <label className={"toggle-label"}>
        {t(props.settingName)}
      </label>
      <ToggleButton disabled={props.layerOff}
        className={getModifiedClassNameDefaultFalse(props.truthyDefault
          ? props.value
          : !props.value)}
        toggleValue={props.value}
        toggleAction={props.toggle(props.dispatch)} />
    </div>
  </Highlight>;

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
        customIcon={"fa-exclamation-triangle"} />
    </div>
    : <div className={"filters-enabled-warning"} />;
};
