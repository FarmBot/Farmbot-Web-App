import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import { t } from "i18next";
import { GardenMap } from "./map/garden_map";
import { Props, State, BotOriginQuadrant, isBotOriginQuadrant } from "./interfaces";
import { mapStateToProps } from "./state_to_props";
import { history } from "../history";
import { Plants } from "./plants/plant_inventory";
import { GardenMapLegend } from "./map/garden_map_legend";
import { Session, safeBooleanSettting } from "../session";
import { NumericSetting, BooleanSetting } from "../session_keys";
import { isUndefined } from "lodash";
import { AxisNumberProperty, BotSize } from "./map/interfaces";
import { getBotSize } from "./map/util";
import { catchErrors } from "../util";
import { calcZoomLevel, getZoomLevelIndex, saveZoomLevelIndex } from "./map/zoom";

export const getDefaultAxisLength = (): AxisNumberProperty => {
  if (Session.deprecatedGetBool(BooleanSetting.map_xl)) {
    return { x: 5900, y: 2900 };
  } else {
    return { x: 2900, y: 1400 };
  }
};

export const getGridSize = (botSize: BotSize) => {
  if (Session.deprecatedGetBool(BooleanSetting.dynamic_map)) {
    // Render the map size according to device axis length.
    return { x: botSize.x.value, y: botSize.y.value };
  }
  // Use a default map size.
  return getDefaultAxisLength();
};

export const gridOffset: AxisNumberProperty = { x: 50, y: 50 };

@connect(mapStateToProps)
export class FarmDesigner extends React.Component<Props, Partial<State>> {
  componentDidCatch(x: Error, y: React.ErrorInfo) { catchErrors(x, y); }

  initializeSetting =
    (name: keyof State, defaultValue: boolean): boolean => {
      const currentValue = Session.deprecatedGetBool(safeBooleanSettting(name));
      if (isUndefined(currentValue)) {
        Session.setBool(safeBooleanSettting(name), defaultValue);
        return defaultValue;
      } else {
        return currentValue;
      }
    }

  getBotOriginQuadrant = (): BotOriginQuadrant => {
    const value = Session.deprecatedGetNum(NumericSetting.bot_origin_quadrant);
    return isBotOriginQuadrant(value) ? value : 2;
  }

  state: State = {
    legend_menu_open: this.initializeSetting(BooleanSetting.legend_menu_open, false),
    show_plants: this.initializeSetting(BooleanSetting.show_plants, true),
    show_points: this.initializeSetting(BooleanSetting.show_points, true),
    show_spread: this.initializeSetting(BooleanSetting.show_spread, false),
    show_farmbot: this.initializeSetting(BooleanSetting.show_farmbot, true),
    show_images: this.initializeSetting(BooleanSetting.show_images, false),
    bot_origin_quadrant: this.getBotOriginQuadrant(),
    zoom_level: calcZoomLevel(getZoomLevelIndex())
  };

  componentDidMount() {
    this.updateBotOriginQuadrant(this.state.bot_origin_quadrant)();
    this.updateZoomLevel(0)();
  }

  toggle = (name: keyof State) => () => {
    this.setState({ [name]: !this.state[name] });
    Session.invertBool(safeBooleanSettting(name));
  }

  updateBotOriginQuadrant = (payload: BotOriginQuadrant) => () => {
    this.setState({ bot_origin_quadrant: payload });
    Session.deprecatedSetNum(NumericSetting.bot_origin_quadrant, payload);
  }

  updateZoomLevel = (zoomIncrement: number) => () => {
    const newIndex = getZoomLevelIndex() + zoomIncrement;
    this.setState({ zoom_level: calcZoomLevel(newIndex) });
    saveZoomLevelIndex(newIndex);
  }

  childComponent(props: Props) {
    const fallback = React.createElement(Plants, props);
    return this.props.children || fallback;
  }

  render() {
    /**
     * Kinda nasty, similar to the old q="NoTab" we used to determine no panels.
     * This one just makes sure the designer can click it's panel tabs without
     * the other headers getting in the way. There's more re-usability in this.
     */
    if (history.getCurrentLocation().pathname === "/app/designer") {
      document.body.classList.add("designer-tab");
    } else {
      document.body.classList.remove("designer-tab");
    }

    const {
      legend_menu_open,
      show_plants,
      show_points,
      show_spread,
      show_farmbot,
      show_images,
      bot_origin_quadrant,
      zoom_level
    } = this.state;

    const designerTabClasses: string[] = ["active", "visible-xs"];

    const botSize = getBotSize(
      this.props.botMcuParams, this.props.stepsPerMmXY, getDefaultAxisLength());

    const stopAtHome = {
      x: !!this.props.botMcuParams.movement_stop_at_home_x,
      y: !!this.props.botMcuParams.movement_stop_at_home_y
    };

    return <div className="farm-designer">

      <GardenMapLegend
        zoom={this.updateZoomLevel}
        toggle={this.toggle}
        updateBotOriginQuadrant={this.updateBotOriginQuadrant}
        botOriginQuadrant={bot_origin_quadrant}
        legendMenuOpen={legend_menu_open}
        showPlants={show_plants}
        showPoints={show_points}
        showSpread={show_spread}
        showFarmbot={show_farmbot}
        showImages={show_images}
        dispatch={this.props.dispatch}
        tzOffset={this.props.tzOffset}
        getConfigValue={this.props.getConfigValue} />

      <div className="panel-header gray-panel designer-nav">
        <div className="panel-tabs">
          <Link to="/app/designer" className={designerTabClasses.join(" ")}>
            {t("Designer")}
          </Link>
          <Link to="/app/designer/plants">
            {t("Plants")}
          </Link>
          <Link to="/app/designer/farm_events">
            {t("Farm Events")}
          </Link>
        </div>
      </div>
      <div className="farm-designer-panels">
        {this.childComponent(this.props)}
      </div>

      <div
        className="farm-designer-map"
        style={{ zoom: zoom_level }}>
        <GardenMap
          showPoints={show_points}
          showPlants={show_plants}
          showSpread={show_spread}
          showFarmbot={show_farmbot}
          showImages={show_images}
          selectedPlant={this.props.selectedPlant}
          crops={this.props.crops}
          dispatch={this.props.dispatch}
          designer={this.props.designer}
          plants={this.props.plants}
          points={this.props.points}
          toolSlots={this.props.toolSlots}
          botLocationData={this.props.botLocationData}
          botSize={botSize}
          stopAtHome={stopAtHome}
          hoveredPlant={this.props.hoveredPlant}
          zoomLvl={zoom_level}
          botOriginQuadrant={bot_origin_quadrant}
          gridSize={getGridSize(botSize)}
          gridOffset={gridOffset}
          peripherals={this.props.peripherals}
          eStopStatus={this.props.eStopStatus}
          latestImages={this.props.latestImages}
          cameraCalibrationData={this.props.cameraCalibrationData}
          getConfigValue={this.props.getConfigValue} />
      </div>
    </div>;
  }
}
