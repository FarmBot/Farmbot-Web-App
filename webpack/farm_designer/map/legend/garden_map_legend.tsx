import * as React from "react";
import { t } from "i18next";
import { LayerToggle } from "../legend/layer_toggle";
import { GardenMapLegendProps } from "../interfaces";
import { history } from "../../../history";
import { atMaxZoom, atMinZoom } from "../zoom";
import { ImageFilterMenu } from "../layers/images/image_filter_menu";
import { BugsControls } from "../easter_eggs/bugs";
import { BotOriginQuadrant, State } from "../../interfaces";
import { MoveModeLink } from "../../plants/move_to";
import { SavedGardensLink } from "../../saved_gardens/saved_gardens";
import { GetWebAppConfigValue } from "../../../config_storage/actions";
import { BooleanSetting } from "../../../session_keys";

const OriginSelector = ({ quadrant, update }: {
  quadrant: BotOriginQuadrant,
  update: (quadrant: number) => () => void
}) =>
  <div className="farmbot-origin">
    <label>
      {t("Origin")}
    </label>
    <div className="quadrants">
      {[2, 1, 3, 4].map(q =>
        <div key={"quadrant_" + q}
          className={"quadrant " + (quadrant === q && "selected")}
          onClick={update(q)} />
      )}
    </div>
  </div>;

export const ZoomControls = ({ zoom, getConfigValue }: {
  zoom: (value: number) => () => void,
  getConfigValue: GetWebAppConfigValue
}) => {
  const plusBtnClass = atMaxZoom(getConfigValue) ? "disabled" : "";
  const minusBtnClass = atMinZoom(getConfigValue) ? "disabled" : "";
  return <div className="zoom-buttons">
    <button
      className={"fb-button gray zoom " + plusBtnClass}
      onClick={zoom(1)}>
      <i className="fa fa-2x fa-plus" />
    </button>
    <button
      className={"fb-button gray zoom zoom-out " + minusBtnClass}
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
    <button className={"fb-button green"}
      onClick={() => history.push("/app/designer/plants/create_point")}>
      {t("Point Creator")}
    </button>
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
      onClick={toggle("show_plants")} />
    <LayerToggle
      value={props.showPoints}
      label={t("Points?")}
      onClick={toggle("show_points")}
      submenuTitle={t("extras")}
      popover={!!localStorage.getItem("FUTURE_FEATURES")
        ? <PointsSubMenu toggle={toggle} getConfigValue={getConfigValue} />
        : undefined} />
    <LayerToggle
      value={props.showSpread}
      label={t("Spread?")}
      onClick={toggle("show_spread")} />
    <LayerToggle
      value={props.showFarmbot}
      label={t("FarmBot?")}
      onClick={toggle("show_farmbot")} />
    <LayerToggle
      value={props.showImages}
      label={t("Photos?")}
      onClick={toggle("show_images")}
      submenuTitle={t("filter")}
      popover={<ImageFilterMenu
        tzOffset={props.tzOffset}
        dispatch={props.dispatch}
        getConfigValue={getConfigValue}
        imageAgeInfo={props.imageAgeInfo} />} />
    {localStorage.getItem("FUTURE_FEATURES") &&
      <LayerToggle
        value={props.showSensorReadings}
        label={t("Readings?")}
        onClick={toggle("show_sensor_readings")} />}
  </div>;
};

export function GardenMapLegend(props: GardenMapLegendProps) {
  const menuClass = props.legendMenuOpen ? "active" : "";
  return <div
    className={"garden-map-legend " + menuClass}
    style={{ zoom: 1 }}>
    <div
      className={"menu-pullout " + menuClass}
      onClick={props.toggle("legend_menu_open")}>
      <span>
        {t("Menu")}
      </span>
      <i className="fa fa-2x fa-arrow-left" />
    </div>
    <div className="content">
      <ZoomControls zoom={props.zoom} getConfigValue={props.getConfigValue} />
      <LayerToggles {...props} />
      <OriginSelector
        quadrant={props.botOriginQuadrant}
        update={props.updateBotOriginQuadrant} />
      <MoveModeLink />
      <SavedGardensLink />
      <BugsControls />
    </div>
  </div>;
}
