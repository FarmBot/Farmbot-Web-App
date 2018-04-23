import * as React from "react";
import { t } from "i18next";
import { LayerToggle } from "./layer_toggle";
import { GardenMapLegendProps } from "./interfaces";
import { history } from "../../history";
import { atMaxZoom, atMinZoom } from "./zoom";
import { ImageFilterMenu } from "./image_filter_menu";
import { bugsControls } from "./easter_eggs/bugs";
// import { snapshotGarden } from "../../saved_gardens/snapshot";

export function GardenMapLegend(props: GardenMapLegendProps) {

  const {
    zoom,
    toggle,
    updateBotOriginQuadrant,
    botOriginQuadrant,
    legendMenuOpen,
    showPlants,
    showPoints,
    showSpread,
    showFarmbot,
    showImages,
    dispatch,
    tzOffset,
    getConfigValue,
    imageAgeInfo,
  } = props;

  const plusBtnClass = atMaxZoom() ? "disabled" : "";
  const minusBtnClass = atMinZoom() ? "disabled" : "";
  const menuClass = legendMenuOpen ? "active" : "";

  return <div
    className={"garden-map-legend " + menuClass}
    style={{ zoom: 1 }}>
    <div
      className={"menu-pullout " + menuClass}
      onClick={toggle("legend_menu_open")}>
      <span>
        {t("Menu")}
      </span>
      <i className="fa fa-2x fa-arrow-left" />
    </div>
    <div className="content">
      <div className="zoom-buttons">
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
      </div>
      <div className="toggle-buttons">
        <LayerToggle
          value={showPlants}
          label={t("Plants?")}
          onClick={toggle("show_plants")} />
        <LayerToggle
          value={showPoints}
          label={t("Points?")}
          onClick={toggle("show_points")} />
        <LayerToggle
          value={showSpread}
          label={t("Spread?")}
          onClick={toggle("show_spread")} />
        <LayerToggle
          value={showFarmbot}
          label={t("FarmBot?")}
          onClick={toggle("show_farmbot")} />
        <LayerToggle
          value={showImages}
          label={t("Photos?")}
          onClick={toggle("show_images")}
          popover={<ImageFilterMenu
            tzOffset={tzOffset}
            dispatch={dispatch}
            getConfigValue={getConfigValue}
            imageAgeInfo={imageAgeInfo} />} />
      </div>
      <div className="farmbot-origin">
        <label>
          {t("Origin")}
        </label>
        <div className="quadrants">
          <div
            className={"quadrant " + (botOriginQuadrant === 2 && "selected")}
            onClick={updateBotOriginQuadrant(2)} />
          <div
            className={"quadrant " + (botOriginQuadrant === 1 && "selected")}
            onClick={updateBotOriginQuadrant(1)} />
          <div
            className={"quadrant " + (botOriginQuadrant === 3 && "selected")}
            onClick={updateBotOriginQuadrant(3)} />
          <div
            className={"quadrant " + (botOriginQuadrant === 4 && "selected")}
            onClick={updateBotOriginQuadrant(4)} />
        </div>
      </div>
      <div className="move-to-mode">
        <button
          className="fb-button gray"
          onClick={() => history.push("/app/designer/plants/move_to")}>
          {t("move mode")}
        </button>
      </div>
      {/*
        // This works, but SavedGarden management is a WIP. -RC
        <button className="fb-button gray" onClick={snapShotGarden}>
        {t("Snapshot")}
        </button>
      */}
      {bugsControls()}
    </div>
  </div>;
}
