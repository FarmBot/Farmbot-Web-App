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
import { Help, Popover, ToggleButton } from "../../../ui";
import {
  BooleanConfigKey as WebAppBooleanConfigKey,
} from "farmbot/dist/resources/configs/web_app";
import { ZDisplay, ZDisplayToggle } from "./z_display";
import { getModifiedClassName } from "../../../settings/default_values";
import { Position } from "@blueprintjs/core";
import { MapSizeInputs } from "../../map_size_setting";
import { OriginSelector } from "../../../settings/farm_designer_settings";
import { McuParams } from "farmbot";

export interface ZoomControlsProps {
  zoom(value: number): () => void;
  getConfigValue: GetWebAppConfigValue;
}

export const ZoomControls = (props: ZoomControlsProps) => {
  const { zoom, getConfigValue } = props;
  const plusBtnClass = atMaxZoom(getConfigValue) ? "disabled" : "";
  const minusBtnClass = atMinZoom(getConfigValue) ? "disabled" : "";
  return <div className="zoom-buttons">
    <button
      className={[
        "fb-button gray zoom", plusBtnClass,
      ].join(" ")}
      title={t("zoom in")}
      onClick={zoom(1)}>
      <i className="fa fa-2x fa-plus" />
    </button>
    <button
      className={[
        "fb-button gray zoom zoom-out", minusBtnClass,
      ].join(" ")}
      title={t("zoom out")}
      onClick={zoom(-1)}>
      <i className="fa fa-2x fa-minus" />
    </button>
  </div>;
};

interface NonLayerToggleProps {
  setting?: WebAppBooleanConfigKey;
  label: string;
  helpText?: string;
  getConfigValue: GetWebAppConfigValue;
  dispatch: Function;
  disabled?: boolean;
  invert?: boolean;
  children?: React.ReactNode;
}

const NonLayerToggle = (props: NonLayerToggleProps) => {
  const { setting, getConfigValue } = props;
  const value = !!(setting ? getConfigValue(setting) : undefined);
  return <div
    className={[
      "row grid-exp-1 align-baseline",
    ].join(" ")}>
    <label>{t(props.label)}</label>
    {props.helpText && <Help text={props.helpText} />}
    {setting && <ToggleButton
      disabled={props.disabled}
      className={getModifiedClassName(setting)}
      title={t(props.label)}
      toggleAction={() =>
        props.dispatch(setWebAppConfigValue(setting, !value))}
      toggleValue={props.invert ? !value : value} />}
    {props.children}
  </div>;
};

export interface SettingsSubMenuProps {
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  firmwareConfig: McuParams;
}

export const PointsSubMenu = (props: SettingsSubMenuProps) =>
  <div className="map-points-submenu">
    <NonLayerToggle {...props}
      setting={BooleanSetting.show_historic_points}
      label={DeviceSetting.showRemovedWeeds} />
  </div>;

export const PlantsSubMenu = (props: SettingsSubMenuProps) =>
  <div className="grid">
    <NonLayerToggle {...props}
      setting={BooleanSetting.disable_animations}
      label={DeviceSetting.animations}
      helpText={Content.PLANT_ANIMATIONS}
      invert={true} />
    <NonLayerToggle {...props}
      setting={BooleanSetting.confirm_plant_deletion}
      label={DeviceSetting.confirmPlantDeletion}
      helpText={Content.CONFIRM_PLANT_DELETION} />
  </div>;

export const FarmbotSubMenu = (props: SettingsSubMenuProps) =>
  <div className="grid">
    <NonLayerToggle {...props}
      setting={BooleanSetting.display_trail}
      label={DeviceSetting.trail}
      helpText={Content.VIRTUAL_TRAIL} />
    <NonLayerToggle {...props}
      setting={BooleanSetting.display_map_missed_steps}
      label={DeviceSetting.mapMissedSteps}
      helpText={Content.MAP_MISSED_STEPS}
      disabled={!props.getConfigValue(BooleanSetting.display_trail)} />
  </div>;

interface LayerTogglesProps extends GardenMapLegendProps { }

const LayerToggles = (props: LayerTogglesProps) => {
  const { toggle, getConfigValue, dispatch, firmwareConfig } = props;
  const subMenuProps = { dispatch, getConfigValue, firmwareConfig };
  const only2DClass =
    getConfigValue(BooleanSetting.three_d_garden) ? "disabled" : "";
  return <div className="toggle-buttons">
    <LayerToggle
      settingName={BooleanSetting.show_plants}
      value={props.showPlants}
      label={DeviceSetting.showPlants}
      onClick={toggle(BooleanSetting.show_plants)}
      submenuTitle={t("extras")}
      popover={<PlantsSubMenu {...subMenuProps} />} />
    <LayerToggle
      settingName={BooleanSetting.show_points}
      value={props.showPoints}
      label={DeviceSetting.showPoints}
      onClick={toggle(BooleanSetting.show_points)} />
    <LayerToggle
      className={only2DClass}
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
      className={only2DClass}
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
      className={only2DClass}
      settingName={BooleanSetting.show_images}
      value={props.showImages}
      label={DeviceSetting.showPhotos}
      onClick={toggle(BooleanSetting.show_images)}
      submenuTitle={t("filter")}
      popover={<div className={"grid"}>
        <ImageFilterMenu {...subMenuProps}
          timeSettings={props.timeSettings}
          imageAgeInfo={props.imageAgeInfo} />
        <NonLayerToggle {...subMenuProps}
          setting={BooleanSetting.crop_images}
          label={DeviceSetting.cropMapImages}
          helpText={Content.CROP_MAP_IMAGES} />
        <NonLayerToggle {...subMenuProps}
          setting={BooleanSetting.clip_image_layer}
          label={DeviceSetting.clipPhotosOutOfBounds}
          helpText={Content.CLIP_PHOTOS_OUT_OF_BOUNDS} />
        <NonLayerToggle {...subMenuProps}
          setting={BooleanSetting.show_camera_view_area}
          label={DeviceSetting.cameraView}
          helpText={Content.SHOW_CAMERA_VIEW_AREA} />
        <NonLayerToggle {...subMenuProps}
          setting={BooleanSetting.show_uncropped_camera_view_area}
          label={DeviceSetting.uncroppedCameraView}
          helpText={Content.SHOW_UNCROPPED_CAMERA_VIEW_AREA} />
      </div>} />
    <LayerToggle
      className={only2DClass}
      settingName={BooleanSetting.show_zones}
      value={props.showZones}
      label={DeviceSetting.showAreas}
      onClick={toggle(BooleanSetting.show_zones)} />
    {props.hasSensorReadings &&
      <LayerToggle
        className={only2DClass}
        settingName={BooleanSetting.show_sensor_readings}
        value={props.showSensorReadings}
        label={DeviceSetting.showReadings}
        onClick={toggle(BooleanSetting.show_sensor_readings)} />}
    {props.hasSensorReadings &&
      <LayerToggle
        className={only2DClass}
        settingName={BooleanSetting.show_moisture_interpolation_map}
        value={props.showMoistureInterpolationMap}
        label={DeviceSetting.showMoisture}
        onClick={toggle(BooleanSetting.show_moisture_interpolation_map)} />}
  </div>;
};

export const MapSettingsContent = (props: SettingsSubMenuProps) =>
  <div className="grid">
    <NonLayerToggle {...props}
      setting={BooleanSetting.dynamic_map}
      label={DeviceSetting.dynamicMap}
      helpText={Content.DYNAMIC_MAP_SIZE} />
    <NonLayerToggle {...props}
      label={DeviceSetting.mapSize}
      helpText={Content.MAP_SIZE}>
      <MapSizeInputs {...props} />
    </NonLayerToggle>
    <NonLayerToggle {...props}
      setting={BooleanSetting.xy_swap}
      label={DeviceSetting.rotateMap}
      helpText={Content.MAP_SWAP_XY} />
    <NonLayerToggle {...props}
      label={DeviceSetting.mapOrigin}
      helpText={Content.MAP_ORIGIN}>
      <OriginSelector {...props} />
    </NonLayerToggle>
  </div>;

const MapSettings = (props: SettingsSubMenuProps) =>
  <div className="map-settings">
    <Popover
      position={Position.BOTTOM_RIGHT}
      className={"caret-menu-button"}
      target={<button
        className="fb-button gray"
        title={t("open map settings menu")}>
        {t("map settings")}
      </button>}
      content={<MapSettingsContent {...props} />} />
  </div>;

export function GardenMapLegend(props: GardenMapLegendProps) {
  const { getConfigValue } = props;
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
        <ZoomControls zoom={props.zoom} getConfigValue={getConfigValue} />
        <LayerToggles {...props} />
        <MoveModeLink dispatch={props.dispatch} />
        <MapSettings
          getConfigValue={getConfigValue}
          dispatch={props.dispatch}
          firmwareConfig={props.firmwareConfig} />
        <SelectModeLink dispatch={props.dispatch} />
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
