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
import { Actions, DeviceSetting, Content } from "../../../constants";
import { Help, Popover, ToggleButton } from "../../../ui";
import {
  BooleanConfigKey as WebAppBooleanConfigKey,
} from "farmbot/dist/resources/configs/web_app";
import { ZDisplay, ZDisplayToggle } from "./z_display";
import { getModifiedClassName } from "../../../settings/default_values";
import { Position } from "@blueprintjs/core";
import { MapSizeInputs } from "../../map_size_setting";
import {
  CameraStartingLocationButton, OriginSelector,
} from "../../../settings/farm_designer_settings";
import { McuParams } from "farmbot";
import { DesignerState } from "../../interfaces";
import { isMobile } from "../../../screen_size";
import type { Config } from "../../../three_d_garden/config";
import { ThreeDSectionSettings } from "../../three_d_section";

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
  get3DConfigValue?(key: keyof Config): number;
  set3DConfigValue?(key: keyof Config, value: string): void;
  firmwareConfig: McuParams;
  designer: DesignerState;
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

export const FarmbotSubMenu = (props: SettingsSubMenuProps) => {
  const laser = !!props.get3DConfigValue?.("laser");
  const is3D = props.getConfigValue(BooleanSetting.three_d_garden);
  const laserAvailable = !!(props.get3DConfigValue && props.set3DConfigValue);
  return <div className="grid">
    <NonLayerToggle {...props}
      setting={BooleanSetting.display_trail}
      label={DeviceSetting.trail}
      helpText={Content.VIRTUAL_TRAIL} />
    {is3D && laserAvailable &&
      <NonLayerToggle {...props}
        label={"LASER"}>
        <ToggleButton
          title={t("LASER")}
          toggleValue={laser}
          toggleAction={() => props.set3DConfigValue?.(
            "laser", laser ? "0" : "1")} />
      </NonLayerToggle>}
    <NonLayerToggle {...props}
      setting={BooleanSetting.display_map_missed_steps}
      label={DeviceSetting.mapMissedSteps}
      helpText={Content.MAP_MISSED_STEPS}
      disabled={!props.getConfigValue(BooleanSetting.display_trail)} />
  </div>;
};

interface LayerTogglesProps extends GardenMapLegendProps {
  zDisplayOpen: boolean;
  setZDisplayOpen(open: boolean): void;
}

interface GardenMapLegendToggleProps {
  label: string;
  value: boolean;
  onClick(): void;
  settingName?: WebAppBooleanConfigKey;
  labelClassName?: string;
  children?: React.ReactNode;
}

const GardenMapLegendToggle = (props: GardenMapLegendToggleProps) => {
  const classNames = [
    "fb-button",
    "fb-toggle-button",
    "fb-layer-toggle",
    props.value ? "green" : "red",
    props.settingName ? getModifiedClassName(props.settingName) : "",
  ].join(" ");
  return <fieldset>
    <label>
      <span className={props.labelClassName}>
        {t(props.label)}{props.children}
      </span>
    </label>
    <button className={classNames} onClick={props.onClick}
      title={`${props.value ? t("hide") : t("show")} ${t(props.label)}`} />
  </fieldset>;
};

const LayerToggles = (props: LayerTogglesProps) => {
  const { toggle, getConfigValue, dispatch, firmwareConfig, designer } = props;
  const subMenuProps = {
    dispatch,
    getConfigValue,
    get3DConfigValue: props.get3DConfigValue,
    set3DConfigValue: props.set3DConfigValue,
    firmwareConfig,
    designer,
  };
  const is3D = getConfigValue(BooleanSetting.three_d_garden);
  const only2DClass = is3D ? "disabled" : "";
  const sectionOpen = designer.threeDSectionOpen;
  const exaggeratedZ = designer.threeDExaggeratedZ;
  const description = (isMobile()
    ? Content.SHOW_3D_VIEW_DESCRIPTION_MOBILE
    : Content.SHOW_3D_VIEW_DESCRIPTION_DESKTOP)
    .trim().replace(/\n\s+/g, "\n");
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
    {!is3D &&
      <LayerToggle
        settingName={BooleanSetting.show_soil_interpolation_map}
        value={props.showSoilInterpolationMap}
        label={DeviceSetting.showSoil}
        onClick={toggle(BooleanSetting.show_soil_interpolation_map)} />}
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
    <LayerToggle
      settingName={BooleanSetting.show_sensor_readings}
      value={props.showSensorReadings}
      label={DeviceSetting.showReadings}
      onClick={toggle(BooleanSetting.show_sensor_readings)} />
    <LayerToggle
      settingName={BooleanSetting.show_moisture_interpolation_map}
      value={props.showMoistureInterpolationMap}
      label={DeviceSetting.showMoisture}
      onClick={toggle(BooleanSetting.show_moisture_interpolation_map)} />
    <GardenMapLegendToggle
      settingName={BooleanSetting.three_d_garden}
      value={!!is3D}
      label={DeviceSetting.show3DMap}
      labelClassName={"row half-gap grid-exp-2"}
      onClick={() => dispatch(setWebAppConfigValue(
        BooleanSetting.three_d_garden, !is3D))}>
      {is3D &&
        <Help
          text={description}
          enableMarkdown={true}
          position={Position.BOTTOM_RIGHT}
          customClass={"three-d-controls-help"}
          title={t("3D Controls")}
          ariaLabel={`${t(DeviceSetting.show3DMap)} help`} />}
    </GardenMapLegendToggle>
    {is3D &&
      <GardenMapLegendToggle
        value={sectionOpen}
        label={"SECTION"}
        labelClassName={"row half-gap grid-exp-2"}
        onClick={() => dispatch({
          type: Actions.SET_3D_SECTION_OPEN,
          payload: !sectionOpen,
        })}>
        <Popover
          position={Position.BOTTOM_RIGHT}
          className={"caret-menu-button"}
          target={<button type={"button"}
            className={"fb-icon-button invert"}
            title={t("section settings")}
            aria-label={t("section settings")}
            aria-haspopup={"menu"}>
            <i className={"fa fa-caret-down"} aria-hidden={true} />
          </button>}
          content={<ThreeDSectionSettings
            designer={designer}
            dispatch={dispatch}
            gardenSize={props.gardenSize} />} />
      </GardenMapLegendToggle>}
    {is3D &&
      <GardenMapLegendToggle
        value={exaggeratedZ}
        label={"Amplify Z"}
        onClick={() => dispatch({
          type: Actions.TOGGLE_3D_EXAGGERATED_Z,
          payload: !exaggeratedZ,
        })} />}
    <ZDisplayToggle
      open={props.zDisplayOpen}
      setOpen={props.setZDisplayOpen} />
  </div>;
};

export const MapSettingsContent = (props: SettingsSubMenuProps) => {
  const is3D = props.getConfigValue(BooleanSetting.three_d_garden);
  return <div className="grid">
    <NonLayerToggle {...props}
      setting={BooleanSetting.dynamic_map}
      label={DeviceSetting.dynamicMap}
      helpText={Content.DYNAMIC_MAP_SIZE} />
    <NonLayerToggle {...props}
      label={DeviceSetting.mapSize}
      helpText={Content.MAP_SIZE}>
      <MapSizeInputs {...props} />
    </NonLayerToggle>
    {!is3D && <NonLayerToggle {...props}
      setting={BooleanSetting.xy_swap}
      label={DeviceSetting.rotateMap}
      helpText={Content.MAP_SWAP_XY} />}
    {!is3D && <NonLayerToggle {...props}
      label={DeviceSetting.mapOrigin}
      helpText={Content.MAP_ORIGIN}>
      <OriginSelector {...props} />
    </NonLayerToggle>}
    {is3D && <div
      className={"row grid-exp-1 align-baseline"}>
      <label>{t(DeviceSetting.setCameraStartingLocation)}</label>
      <CameraStartingLocationButton dispatch={props.dispatch} />
    </div>}
  </div>;
};

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
  const is3D = props.getConfigValue(BooleanSetting.three_d_garden);
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
        {!is3D && <ZoomControls zoom={props.zoom} getConfigValue={getConfigValue} />}
        <LayerToggles
          {...props}
          zDisplayOpen={zDisplayOpen}
          setZDisplayOpen={setZDisplayOpen} />
        <MoveModeLink dispatch={props.dispatch} />
        <MapSettings
          getConfigValue={getConfigValue}
          dispatch={props.dispatch}
          designer={props.designer}
          firmwareConfig={props.firmwareConfig} />
        <SelectModeLink dispatch={props.dispatch} />
        <i className="fa fa-question-circle"
          style={{ fontSize: "2rem" }}
          title={t("Highlight clickable objects in the map")}
          onMouseEnter={() => props.dispatch({
            type: Actions.SET_3D_HIGHLIGHT,
            payload: "all",
          })}
          onMouseLeave={() => props.dispatch({
            type: Actions.SET_3D_HIGHLIGHT,
            payload: undefined,
          })} />
        <BugsControls />
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
