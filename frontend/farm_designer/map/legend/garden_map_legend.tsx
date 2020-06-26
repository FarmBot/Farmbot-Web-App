import * as React from "react";
import { LayerToggle } from "../legend/layer_toggle";
import { GardenMapLegendProps } from "../interfaces";
import { atMaxZoom, atMinZoom } from "../zoom";
import { ImageFilterMenu } from "../layers/images/image_filter_menu";
import { BugsControls } from "../easter_eggs/bugs";
import { State } from "../../interfaces";
import { MoveModeLink } from "../../move_to";
import { GetWebAppConfigValue } from "../../../config_storage/actions";
import { BooleanSetting } from "../../../session_keys";
import { t } from "../../../i18next_wrapper";
import { Feature } from "../../../devices/interfaces";
import { SelectModeLink } from "../../plants/select_plants";
import { DeviceSetting } from "../../../constants";

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

export const PointsSubMenu = ({ toggle, getConfigValue }: {
  toggle: (property: keyof State) => () => void,
  getConfigValue: GetWebAppConfigValue
}) =>
  <div className="map-points-submenu">
    <LayerToggle
      value={!!getConfigValue(BooleanSetting.show_historic_points)}
      label={DeviceSetting.showRemovedWeeds}
      onClick={toggle(BooleanSetting.show_historic_points)} />
  </div>;

const LayerToggles = (props: GardenMapLegendProps) => {
  const { toggle, getConfigValue } = props;
  return <div className="toggle-buttons">
    <LayerToggle
      value={props.showPlants}
      label={DeviceSetting.showPlants}
      onClick={toggle(BooleanSetting.show_plants)} />
    <LayerToggle
      value={props.showPoints}
      label={DeviceSetting.showPoints}
      onClick={toggle(BooleanSetting.show_points)} />
    <LayerToggle
      value={props.showWeeds}
      label={DeviceSetting.showWeeds}
      onClick={toggle(BooleanSetting.show_weeds)}
      submenuTitle={t("extras")}
      popover={
        <PointsSubMenu toggle={toggle} getConfigValue={getConfigValue} />} />
    <LayerToggle
      value={props.showSpread}
      label={DeviceSetting.showSpread}
      onClick={toggle(BooleanSetting.show_spread)} />
    <LayerToggle
      value={props.showFarmbot}
      label={DeviceSetting.showFarmbot}
      onClick={toggle(BooleanSetting.show_farmbot)} />
    <LayerToggle
      value={props.showImages}
      label={DeviceSetting.showPhotos}
      onClick={toggle(BooleanSetting.show_images)}
      submenuTitle={t("filter")}
      popover={<ImageFilterMenu
        timeSettings={props.timeSettings}
        dispatch={props.dispatch}
        getConfigValue={getConfigValue}
        imageAgeInfo={props.imageAgeInfo} />} />
    {props.shouldDisplay(Feature.criteria_groups) &&
      <LayerToggle
        value={props.showZones}
        label={DeviceSetting.showAreas}
        onClick={toggle(BooleanSetting.show_zones)} />}
    {props.hasSensorReadings &&
      <LayerToggle
        value={props.showSensorReadings}
        label={DeviceSetting.showReadings}
        onClick={toggle(BooleanSetting.show_sensor_readings)} />}
  </div>;
};

export function GardenMapLegend(props: GardenMapLegendProps) {
  const menuClass = props.legendMenuOpen ? "active" : "";
  return <div className={`garden-map-legend ${menuClass} ${props.className}`}>
    <div className={"menu-pullout " + menuClass}
      onClick={props.toggle(BooleanSetting.legend_menu_open)}>
      <span>
        {t("Menu")}
      </span>
      <i className="fa fa-2x fa-arrow-left" />
    </div>
    <div className="content">
      <ZoomControls zoom={props.zoom} getConfigValue={props.getConfigValue} />
      <LayerToggles {...props} />
      <MoveModeLink />
      <SelectModeLink />
      <BugsControls />
    </div>
  </div>;
}
