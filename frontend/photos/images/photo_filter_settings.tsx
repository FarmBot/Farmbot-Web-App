import * as React from "react";
import moment from "moment";
import { TaggedImage } from "farmbot";
import { round } from "lodash";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";
import { Collapse } from "@blueprintjs/core";
import {
  setWebAppConfigValues, ImageFilterMenu, calculateImageAgeInfo,
} from "./image_filter_menu";
import { ToggleButton } from "../../controls/toggle_button";
import { Help, ExpandableHeader } from "../../ui";
import {
  GetWebAppConfigValue, setWebAppConfigValue,
} from "../../config_storage/actions";
import { BooleanSetting } from "../../session_keys";
import { ImageShowFlags, ImageFilterProps } from "./shown_in_map";
import { toggleAlwaysHighlightImage, toggleSingleImageMode } from "./actions";
import {
  BooleanConfigKey, StringConfigKey,
} from "farmbot/dist/resources/configs/web_app";

interface PhotoFilterSettingsState {
  open: boolean;
}

export interface PhotoFilterSettingsProps {
  dispatch: Function;
  images: TaggedImage[];
  image: TaggedImage | undefined;
  timeSettings: TimeSettings;
  flags: ImageShowFlags;
  hideUnShownImages: boolean;
  alwaysHighlightImage: boolean;
  getConfigValue: GetWebAppConfigValue;
}

export class PhotoFilterSettings
  extends React.Component<PhotoFilterSettingsProps, PhotoFilterSettingsState> {
  state: PhotoFilterSettingsState = { open: false };

  get filtersEnabled() {
    return !!parseFilterSetting(this.props.getConfigValue)("photo_filter_begin")
      || !!parseFilterSetting(this.props.getConfigValue)("photo_filter_end")
      || this.props.hideUnShownImages
      || !this.props.flags.layerOn;
  }

  render() {
    const { dispatch, image, images, flags, getConfigValue, timeSettings,
      alwaysHighlightImage, hideUnShownImages,
    } = this.props;
    const layerOff = !this.props.flags.layerOn;
    const commonProps = { dispatch, image };
    return <div className={"photo-filter-settings"}>
      <ExpandableHeader
        expanded={this.state.open}
        title={t("Filter map photos")}
        onClick={() => this.setState({ open: !this.state.open })} />
      {this.filtersEnabled && <Help text={t("Map filters enabled.")}
        customIcon={"exclamation-triangle"} />}
      <Collapse isOpen={this.state.open}>
        <div className={`filter-controls ${
          hideUnShownImages ? "single-image-mode" : ""} ${
          layerOff ? "image-layer-disabled" : ""
          }`}>
          <p className={"banner"}>{layerOff
            ? t("Map photo layer off")
            : t("Single photo mode active")}</p>
          <button className="fb-button red" onClick={() =>
            dispatch(setWebAppConfigValues({
              photo_filter_begin: "", photo_filter_end: "",
            }))}>{t("Reset filters")}</button>
          <ImageFilterMenu key={JSON.stringify(IMAGE_LAYER_CONFIG_KEYS
            .map(key => this.props.getConfigValue(key)))}
            dispatch={dispatch}
            getConfigValue={getConfigValue}
            timeSettings={timeSettings}
            imageAgeInfo={calculateImageAgeInfo(images)} />
          <FilterAroundThisImage {...commonProps} flags={flags} />
          <FilterOlderOrNewer {...commonProps} flags={flags} />
        </div>
        <label className={"toggle-label"}>{t("show photos in map")}</label>
        <ToggleButton toggleValue={!layerOff}
          toggleAction={() => dispatch(setWebAppConfigValue(
            BooleanSetting.show_images, layerOff))} />
        <label className={"toggle-label"}>
          {t("always highlight current photo in map")}
        </label>
        <ToggleButton disabled={layerOff}
          toggleValue={alwaysHighlightImage}
          toggleAction={() =>
            dispatch(toggleAlwaysHighlightImage(alwaysHighlightImage, image))} />
        <label className="toggle-label">
          {t("only show current photo in map")}
        </label>
        <ToggleButton disabled={layerOff}
          toggleValue={hideUnShownImages}
          toggleAction={() => dispatch(toggleSingleImageMode(image))} />
      </Collapse>
    </div>;
  }
}

export const parseFilterSetting = (getConfigValue: GetWebAppConfigValue) =>
  (setting: "photo_filter_begin" | "photo_filter_end"): string | undefined => {
    const value = getConfigValue(setting);
    return value ? value.toString() : undefined;
  };

interface FilterAroundThisImageState {
  seconds: number;
}

export class FilterAroundThisImage
  extends React.Component<ImageFilterProps, FilterAroundThisImageState> {
  state: FilterAroundThisImageState = { seconds: 60 };
  render() {
    const { dispatch, image, flags } = this.props;
    return <div className={"this-image-section"}>
      <div className={"content"}>
        <p>{t("show only photos taken within")}</p>
        <input type="number"
          value={round(this.state.seconds / 60)}
          onChange={e =>
            this.setState({ seconds: parseFloat(e.currentTarget.value) * 60 })} />
        <p>{t("minutes of")}</p>
        <button
          className={"fb-button yellow"}
          disabled={!(flags.zMatch && flags.notHidden)}
          title={t("this photo")}
          onClick={() => image && dispatch(setWebAppConfigValues({
            photo_filter_begin: filterTime("before", this.state.seconds)(image),
            photo_filter_end: filterTime("after", this.state.seconds)(image),
          }))}>
          {t("this photo")}
        </button>
        <p>{t("in map")}</p>
      </div>
    </div>;
  }
}

const filterTime = (direction: "before" | "after", seconds = 1) =>
  (image: TaggedImage) =>
    moment(image.body.created_at)
      .add(direction == "before" ? -seconds : seconds, "second")
      .toISOString();

const FilterOlderOrNewer = ({ dispatch, image, flags }: ImageFilterProps) =>
  <div className={"newer-older-images-section"}>
    <p>{t("show only this photo and")}</p>
    <div className={"buttons"}>
      <button
        className={"fb-button yellow"}
        disabled={!(flags.zMatch && flags.notHidden)}
        title={t("older")}
        onClick={() => image && dispatch(setWebAppConfigValues({
          photo_filter_begin: "", photo_filter_end: filterTime("after")(image),
        }))}>
        <i className="fa fa-arrow-left" />
        {t("older")}
      </button>
      <button
        className={"fb-button yellow"}
        disabled={!(flags.zMatch && flags.notHidden)}
        title={t("newer")}
        onClick={() => image && dispatch(setWebAppConfigValues({
          photo_filter_begin: filterTime("before")(image), photo_filter_end: "",
        }))}>
        {t("newer")}
        <i className="fa fa-arrow-right" />
      </button>
    </div>
    <p>{t("photos in map")}</p>
  </div>;

export const IMAGE_LAYER_CONFIG_KEYS: (BooleanConfigKey | StringConfigKey)[] = [
  "photo_filter_begin",
  "photo_filter_end",
  BooleanSetting.crop_images,
  BooleanSetting.show_images,
];
