import React from "react";
import { LayerToggle } from "../legend/layer_toggle";
import { GardenMapLegendProps } from "../interfaces";
import { atMaxZoom, atMinZoom } from "../zoom";
import {
  ImageFilterMenu,
} from "../../../photos/photo_filter_settings/image_filter_menu";
import { BugsControls } from "../easter_eggs/bugs";
import { MoveModeLink } from "../../move_to";
import {
  GetWebAppConfigValue, setWebAppConfigValue,
} from "../../../config_storage/actions";
import { BooleanSetting } from "../../../session_keys";
import { t } from "../../../i18next_wrapper";
import { SelectModeLink } from "../../../plants/select_plants";
import { DeviceSetting, Content } from "../../../constants";
import { Help, ToggleButton } from "../../../ui";
import {
  BooleanConfigKey as WebAppBooleanConfigKey,
} from "farmbot/dist/resources/configs/web_app";
import { ZDisplay, ZDisplayToggle } from "./z_display";
import { getModifiedClassName } from "../../../settings/default_values";

export const ZoomControls = ({ zoom, getConfigValue }: {
  zoom: (value: number) => () => void,
  getConfigValue: GetWebAppConfigValue
}) => {
  const plusBtnClass = atMaxZoom(getConfigValue) ? "disabled" : "";
  const minusBtnClass = atMinZoom(getConfigValue) ? "disabled" : "";
  return <div className="zoom-buttons">
    <button
      className={"fb-button gray zoom " + plusBtnClass}
      title={t("zoom in")}
      onClick={zoom(1)}>
      <i className="fa fa-2x fa-plus" />
    </button>
    <button
      className={"fb-button gray zoom zoom-out " + minusBtnClass}
      title={t("zoom out")}
      onClick={zoom(-1)}>
      <i className="fa fa-2x fa-minus" />
    </button>
  </div>;
};

interface NonLayerToggleProps {
  setting: WebAppBooleanConfigKey;
  label: string;
  helpText?: string;
  getConfigValue: GetWebAppConfigValue;
  dispatch: Function;
}

const NonLayerToggle = (props: NonLayerToggleProps) => {
  const value = !!props.getConfigValue(props.setting);
  return <div className={"non-layer-config-toggle"}>
    <label>{t(props.label)}</label>
    {props.helpText && <Help text={props.helpText} />}
    <ToggleButton
      className={getModifiedClassName(props.setting)}
      title={t(props.label)}
      toggleAction={() =>
        props.dispatch(setWebAppConfigValue(props.setting, !value))}
      toggleValue={value} />
  </div>;
};

interface LayerSubMenuProps {
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
}

export const PointsSubMenu =
  ({ dispatch, getConfigValue }: LayerSubMenuProps) =>
    <div className="map-points-submenu">
      <NonLayerToggle
        setting={BooleanSetting.show_historic_points}
        label={DeviceSetting.showRemovedWeeds}
        getConfigValue={getConfigValue}
        dispatch={dispatch} />
    </div>;

export const FarmbotSubMenu =
  ({ dispatch, getConfigValue }: LayerSubMenuProps) =>
    <div className="farmbot-layer-submenu">
      <NonLayerToggle
        setting={BooleanSetting.show_camera_view_area}
        label={DeviceSetting.showCameraViewAreaInMap}
        helpText={Content.SHOW_CAMERA_VIEW_AREA}
        getConfigValue={getConfigValue}
        dispatch={dispatch} />
    </div>;

const LayerToggles = (props: GardenMapLegendProps) => {
  const { toggle, getConfigValue, dispatch } = props;
  const subMenuProps = { dispatch, getConfigValue };
  return <div className="toggle-buttons">
    <LayerToggle
      settingName={BooleanSetting.show_plants}
      value={props.showPlants}
      label={DeviceSetting.showPlants}
      onClick={toggle(BooleanSetting.show_plants)} />
    <LayerToggle
      settingName={BooleanSetting.show_points}
      value={props.showPoints}
      label={DeviceSetting.showPoints}
      onClick={toggle(BooleanSetting.show_points)} />
    <LayerToggle
      settingName={BooleanSetting.show_soil_interpolation_map}
      value={props.showSoilInterpolationMap}
      label={DeviceSetting.showSoil}
      onClick={toggle(BooleanSetting.show_soil_interpolation_map)} />
    <LayerToggle
      settingName={BooleanSetting.show_weeds}
      value={props.showWeeds}
      label={DeviceSetting.showWeeds}
      onClick={toggle(BooleanSetting.show_weeds)}
      submenuTitle={t("extras")}
      popover={<PointsSubMenu {...subMenuProps} />} />
    <LayerToggle
      settingName={BooleanSetting.show_spread}
      value={props.showSpread}
      label={DeviceSetting.showSpread}
      onClick={toggle(BooleanSetting.show_spread)} />
    <LayerToggle
      settingName={BooleanSetting.show_farmbot}
      value={props.showFarmbot}
      label={DeviceSetting.showFarmbot}
      onClick={toggle(BooleanSetting.show_farmbot)}
      submenuTitle={t("extras")}
      popover={<FarmbotSubMenu {...subMenuProps} />} />
    <LayerToggle
      settingName={BooleanSetting.show_images}
      value={props.showImages}
      label={DeviceSetting.showPhotos}
      onClick={toggle(BooleanSetting.show_images)}
      submenuTitle={t("filter")}
      popover={<div className={"image-options"}>
        <ImageFilterMenu {...subMenuProps}
          timeSettings={props.timeSettings}
          imageAgeInfo={props.imageAgeInfo} />
        <NonLayerToggle {...subMenuProps}
          setting={BooleanSetting.crop_images}
          label={DeviceSetting.cropMapImages}
          helpText={Content.CROP_MAP_IMAGES} />
      </div>} />
    <LayerToggle
      settingName={BooleanSetting.show_zones}
      value={props.showZones}
      label={DeviceSetting.showAreas}
      onClick={toggle(BooleanSetting.show_zones)} />
    {props.hasSensorReadings &&
      <LayerToggle
        settingName={BooleanSetting.show_sensor_readings}
        value={props.showSensorReadings}
        label={DeviceSetting.showReadings}
        onClick={toggle(BooleanSetting.show_sensor_readings)} />}
    {props.hasSensorReadings &&
      <LayerToggle
        settingName={BooleanSetting.show_moisture_interpolation_map}
        value={props.showMoistureInterpolationMap}
        label={DeviceSetting.showMoisture}
        onClick={toggle(BooleanSetting.show_moisture_interpolation_map)} />}
  </div>;
};

export function GardenMapLegend(props: GardenMapLegendProps) {
  const menuClass = props.legendMenuOpen ? "active" : "";
  const [zDisplayOpen, setZDisplayOpen] = React.useState(false);
  return <div className={`garden-map-legend ${menuClass} ${props.className}`}>
    <div className={"menu-pullout " + menuClass}
      onClick={props.toggle(BooleanSetting.legend_menu_open)}>
      <span>
        {t("Menu")}
      </span>
      <i className="fa fa-2x fa-arrow-left" />
    </div>
    <div className="content">
      <div className="menu-content">
        <ZoomControls zoom={props.zoom} getConfigValue={props.getConfigValue} />
        <LayerToggles {...props} />
        <MoveModeLink />
        <SelectModeLink />
        <BugsControls />
        <ZDisplayToggle open={zDisplayOpen} setOpen={setZDisplayOpen} />
      </div>
      {zDisplayOpen &&
        <ZDisplay
          allPoints={props.allPoints}
          firmwareConfig={props.firmwareConfig}
          sourceFbosConfig={props.sourceFbosConfig}
          botLocationData={props.botLocationData}
          botSize={props.botSize} />}
    </div>
  </div>;
}
