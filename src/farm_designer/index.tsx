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

@connect(mapStateToProps)
export class FarmDesigner extends React.Component<Props, Partial<State>> {

  state: State = {
    legendMenuOpen: false,
    showPlants: true,
    showPoints: true,
    showSpread: false,
    showFarmbot: true
  }

  componentDidMount() {
    this.updateBotOriginQuadrant(this.props.designer.botOriginQuadrant)();
    this.updateZoomLevel(0)();
  }

  toggle = (name: keyof State) => () =>
    this.setState({ [name]: !this.state[name] });

  updateBotOriginQuadrant = (payload: BotOriginQuadrant) => () =>
    this.props.dispatch({ type: "UPDATE_BOT_ORIGIN_QUADRANT", payload });

  updateZoomLevel = (payload: number) => () =>
    this.props.dispatch({ type: "UPDATE_MAP_ZOOM_LEVEL", payload });

  childComponent(props: Props) {
    let fallback = isMobile() ? undefined : React.createElement(Plants, props);
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

    let {
      legendMenuOpen,
      showPlants,
      showPoints,
      showSpread,
      showFarmbot
    } = this.state;

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
        showFarmbot={showFarmbot}
      />

      <div className="panel-header gray-panel designer-mobile-nav">
        <div className="panel-tabs">
          <Link to="/app/designer" className="mobile-only active">
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
          bot={this.props.bot}
          hoveredPlant={this.props.hoveredPlant}
        />
      </div>
    </div>
  }
}
