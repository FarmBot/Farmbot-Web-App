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
import { DevSettings } from "../../../account/dev/dev_support";
import { t } from "../../../i18next_wrapper";

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
      label={t("Historic Points?")}
      onClick={toggle(BooleanSetting.show_historic_points)} />
  </div>;

const LayerToggles = (props: GardenMapLegendProps) => {
  const { toggle, getConfigValue } = props;
  return <div className="toggle-buttons">
    <LayerToggle
      value={props.showPlants}
      label={t("Plants?")}
      onClick={toggle(BooleanSetting.show_plants)} />
    <LayerToggle
      value={props.showPoints}
      label={t("Points?")}
      onClick={toggle(BooleanSetting.show_points)}
      submenuTitle={t("extras")}
      popover={DevSettings.futureFeaturesEnabled()
        ? <PointsSubMenu toggle={toggle} getConfigValue={getConfigValue} />
        : undefined} />
    <LayerToggle
      value={props.showWeeds}
      label={t("Weeds?")}
      onClick={toggle(BooleanSetting.show_weeds)} />
    <LayerToggle
      value={props.showSpread}
      label={t("Spread?")}
      onClick={toggle(BooleanSetting.show_spread)} />
    <LayerToggle
      value={props.showFarmbot}
      label={t("FarmBot?")}
      onClick={toggle(BooleanSetting.show_farmbot)} />
    <LayerToggle
      value={props.showImages}
      label={t("Photos?")}
      onClick={toggle(BooleanSetting.show_images)}
      submenuTitle={t("filter")}
      popover={<ImageFilterMenu
        timeSettings={props.timeSettings}
        dispatch={props.dispatch}
        getConfigValue={getConfigValue}
        imageAgeInfo={props.imageAgeInfo} />} />
    {DevSettings.futureFeaturesEnabled() &&
      <LayerToggle
        value={props.showZones}
        label={t("areas?")}
        onClick={toggle(BooleanSetting.show_zones)} />}
    {DevSettings.futureFeaturesEnabled() && props.hasSensorReadings &&
      <LayerToggle
        value={props.showSensorReadings}
        label={t("Readings?")}
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
      <BugsControls />
    </div>
  </div>;
}
