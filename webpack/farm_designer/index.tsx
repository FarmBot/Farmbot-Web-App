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
import { isMobile } from "../util";
import { Session, safeBooleanSettting } from "../session";
import { NumericSetting, BooleanSetting } from "../session_keys";
import { isUndefined } from "lodash";
import { AxisNumberProperty } from "./map/interfaces";
import { getBotSize } from "./map/util";

export const defaultAxisLength: AxisNumberProperty = { x: 2900, y: 1400 };
export const gridOffset: AxisNumberProperty = { x: 50, y: 50 };

@connect(mapStateToProps)
export class FarmDesigner extends React.Component<Props, Partial<State>> {

  initializeSetting = (name: keyof State, defaultValue: boolean): boolean => {
    const currentValue = Session.getBool(safeBooleanSettting(name));
    if (isUndefined(currentValue)) {
      Session.setBool(safeBooleanSettting(name), defaultValue);
      return defaultValue;
    } else {
      return currentValue;
    }
  }

  getBotOriginQuadrant = (): BotOriginQuadrant => {
    const value = Session.getNum(NumericSetting.botOriginQuadrant);
    return isBotOriginQuadrant(value) ? value : 2;
  }

  getZoomLevel = (): number => {
    return Session.getNum(NumericSetting.zoomLevel) || 1;
  }

  state: State = {
    legendMenuOpen: this.initializeSetting(BooleanSetting.legendMenuOpen, false),
    showPlants: this.initializeSetting(BooleanSetting.showPlants, true),
    showPoints: this.initializeSetting(BooleanSetting.showPoints, true),
    showSpread: this.initializeSetting(BooleanSetting.showSpread, false),
    showFarmbot: this.initializeSetting(BooleanSetting.showFarmbot, true),
    botOriginQuadrant: this.getBotOriginQuadrant(),
    zoomLevel: this.getZoomLevel()
  };

  componentDidMount() {
    this.updateBotOriginQuadrant(this.state.botOriginQuadrant)();
    this.updateZoomLevel(0)();
  }

  toggle = (name: keyof State) => () => {
    this.setState({ [name]: !this.state[name] });
    Session.invertBool(safeBooleanSettting(name));
  }

  updateBotOriginQuadrant = (payload: BotOriginQuadrant) => () => {
    this.setState({ botOriginQuadrant: payload });
    Session.setNum(NumericSetting.botOriginQuadrant, payload);
  }

  updateZoomLevel = (zoomIncrement: number) => () => {
    const payload = this.getZoomLevel() + zoomIncrement;
    this.setState({ zoomLevel: payload });
    Session.setNum(NumericSetting.zoomLevel, payload);
  }

  childComponent(props: Props) {
    const fallback = isMobile() ? undefined : React.createElement(Plants, props);
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
      legendMenuOpen,
      showPlants,
      showPoints,
      showSpread,
      showFarmbot,
      botOriginQuadrant,
      zoomLevel
    } = this.state;

    const designerTabClasses: string[] = ["active", "visible-xs"];

    const botSize = getBotSize(
      this.props.botMcuParams, this.props.stepsPerMmXY, defaultAxisLength);
    /**
     * The next line uses a default for map size (from the top of this file.
     * To render the map according to device axis length, replace the line
     * with the next one.
     * It is recommend to only consider this once device settings are
     * stored in the API to avoid the map changing size when the device
     * is offline. Alternatively, this could be a user option (toggle).
     */
    const gridSize = defaultAxisLength;
    // const gridSize = { x: botSize.x.value, y: botSize.y.value };

    const stopAtHome = {
      x: !!this.props.botMcuParams.movement_stop_at_home_x,
      y: !!this.props.botMcuParams.movement_stop_at_home_y
    };

    return <div className="farm-designer">

      <GardenMapLegend
        zoom={this.updateZoomLevel}
        toggle={this.toggle}
        updateBotOriginQuadrant={this.updateBotOriginQuadrant}
        botOriginQuadrant={botOriginQuadrant}
        zoomLvl={zoomLevel}
        legendMenuOpen={legendMenuOpen}
        showPlants={showPlants}
        showPoints={showPoints}
        showSpread={showSpread}
        showFarmbot={showFarmbot} />

      <div className="panel-header gray-panel designer-mobile-nav">
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
        style={{ zoom: zoomLevel }}>
        <GardenMap
          showPoints={showPoints}
          showPlants={showPlants}
          showSpread={showSpread}
          showFarmbot={showFarmbot}
          selectedPlant={this.props.selectedPlant}
          crops={this.props.crops}
          dispatch={this.props.dispatch}
          designer={this.props.designer}
          plants={this.props.plants}
          points={this.props.points}
          toolSlots={this.props.toolSlots}
          botPosition={this.props.botPosition}
          botSize={botSize}
          stopAtHome={stopAtHome}
          hoveredPlant={this.props.hoveredPlant}
          zoomLvl={Math.round(zoomLevel * 10) / 10}
          botOriginQuadrant={botOriginQuadrant}
          gridSize={gridSize}
          gridOffset={gridOffset} />
      </div>
    </div>;
  }
}
