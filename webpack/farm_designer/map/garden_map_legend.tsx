import * as React from "react";
import { t } from "i18next";
import { LayerToggle } from "./layer_toggle";
import { GardenMapLegendProps } from "./interfaces";

export function GardenMapLegend(props: GardenMapLegendProps) {

  let {
    zoom,
    toggle,
    updateBotOriginQuadrant,
    botOriginQuadrant,
    zoomLvl,
    legendMenuOpen,
    showPlants,
    showPoints,
    showSpread,
    showFarmbot
  } = props;

  let plusBtnClass = (zoomLvl && zoomLvl >= 1.8) ? "disabled" : "";
  let minusBtnClass = (zoomLvl && zoomLvl <= 0.4) ? "disabled" : "";
  let menuClass = legendMenuOpen ? "active" : "";

  return <div
    className={"garden-map-legend " + menuClass}
    style={{ zoom: 1 }}>
    <div
      className={"menu-pullout " + menuClass}
      onClick={toggle("legendMenuOpen")}>
      <span>
        {t("Menu")}
      </span>
      <i className="fa fa-2x fa-arrow-left" />
    </div>
    <div className="content">
      <div className="zoom-buttons">
        <button
          className={"fb-button plus-button green top " + plusBtnClass}
          onClick={zoom(0.1)}>
          <i className="fa fa-2x fa-plus" />
        </button>
        <button
          className={"fb-button plus-button green bottom " + minusBtnClass}
          onClick={zoom(-0.1)}>
          <i className="fa fa-2x fa-minus" />
        </button>
      </div>
      <div className="toggle-buttons">
        <LayerToggle
          value={showPlants}
          label={t("Plants?")}
          onClick={toggle("showPlants")}
        />
        <LayerToggle
          value={showPoints}
          label={t("Points?")}
          onClick={toggle("showPoints")}
        />
        <LayerToggle
          value={showSpread}
          label={t("Spread?")}
          onClick={toggle("showSpread")}
        />
        <LayerToggle
          value={showFarmbot}
          label={t("FarmBot?")}
          onClick={toggle("showFarmbot")}
        />
      </div>
      <div className="farmbot-origin">
        <label>
          {t("Origin")}
        </label>
        <div className="quadrants">
          <div
            className={"quadrant " + (botOriginQuadrant === 2 && "selected")}
            onClick={updateBotOriginQuadrant(2)}
          />
          <div
            className={"quadrant " + (botOriginQuadrant === 1 && "selected")}
            onClick={updateBotOriginQuadrant(1)}
          />
          <div
            className={"quadrant " + (botOriginQuadrant === 3 && "selected")}
            onClick={updateBotOriginQuadrant(3)}
          />
          <div
            className={"quadrant " + (botOriginQuadrant === 4 && "selected")}
            onClick={updateBotOriginQuadrant(4)}
          />
        </div>
      </div>
    </div>
  </div>
}
