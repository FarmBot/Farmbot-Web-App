import * as React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import { t } from "i18next";
import { GardenMap } from "./map/garden_map";
import { Props, State, BotOriginQuadrant } from "./interfaces";
import { mapStateToProps } from "./state_to_props";
import { history } from "../history";
import { Plants } from "./plants/plant_inventory";
import { GardenMapLegend } from "./map/garden_map_legend";
import { isMobile } from "../util";
import { Session, safeBooleanSettting } from "../session";
import { NumericSetting, BooleanSetting } from "../session_keys";
import { isUndefined } from "lodash";

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

  state: State = {
    legendMenuOpen: this.initializeSetting(BooleanSetting.legendMenuOpen, false),
    showPlants: this.initializeSetting(BooleanSetting.showPlants, true),
    showPoints: this.initializeSetting(BooleanSetting.showPoints, true),
    showSpread: this.initializeSetting(BooleanSetting.showSpread, false),
    showFarmbot: this.initializeSetting(BooleanSetting.showFarmbot, true),
  };

  componentDidMount() {
    this.updateBotOriginQuadrant(this.props.designer.botOriginQuadrant)();
    this.updateZoomLevel(0)();
  }

  toggle = (name: keyof State) => () => {
    this.setState({ [name]: !this.state[name] });
    Session.invertBool(safeBooleanSettting(name));
  }

  updateBotOriginQuadrant = (payload: BotOriginQuadrant) => () => {
    Session.setNum(NumericSetting.BOT_ORIGIN_QUADRANT, payload);
    this.props.dispatch({ type: "UPDATE_BOT_ORIGIN_QUADRANT", payload });
  }

  updateZoomLevel = (zoomIncrement: number) => () => {
    const payload =
      (Session.getNum(NumericSetting.ZOOM_LEVEL) || 1) + zoomIncrement;
    Session.setNum(NumericSetting.ZOOM_LEVEL, payload);
    this.props.dispatch({ type: "UPDATE_MAP_ZOOM_LEVEL", payload });
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
      showFarmbot
    } = this.state;

    const designerTabClasses: string[] = ["active", "visible-xs"];

    return <div className="farm-designer">

      <GardenMapLegend
        zoom={this.updateZoomLevel}
        toggle={this.toggle}
        updateBotOriginQuadrant={this.updateBotOriginQuadrant}
        botOriginQuadrant={this.props.designer.botOriginQuadrant}
        zoomLvl={this.props.designer.zoomLevel}
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
        style={{ zoom: this.props.designer.zoomLevel }}>
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
          hoveredPlant={this.props.hoveredPlant}
          zoomLvl={Math.round(this.props.designer.zoomLevel * 10) / 10} />
      </div>
    </div>;
  }
}
