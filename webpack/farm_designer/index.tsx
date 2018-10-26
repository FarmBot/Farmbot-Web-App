import * as React from "react";
import { connect } from "react-redux";
import { GardenMap } from "./map/garden_map";
import { Props, State, BotOriginQuadrant, isBotOriginQuadrant } from "./interfaces";
import { mapStateToProps } from "./state_to_props";
import { history } from "../history";
import { Plants } from "./plants/plant_inventory";
import { GardenMapLegend } from "./map/legend/garden_map_legend";
import { NumericSetting, BooleanSetting } from "../session_keys";
import { isUndefined, last } from "lodash";
import { AxisNumberProperty, BotSize } from "./map/interfaces";
import { getBotSize, round } from "./map/util";
import { calcZoomLevel, getZoomLevelIndex, saveZoomLevelIndex } from "./map/zoom";
import * as moment from "moment";
import { DesignerNavTabs } from "./panel_header";
import { setWebAppConfigValue, GetWebAppConfigValue } from "../config_storage/actions";
import { SavedGardenHUD } from "./saved_gardens/saved_gardens";

export const getDefaultAxisLength =
  (getConfigValue: GetWebAppConfigValue): AxisNumberProperty => {
    if (getConfigValue(BooleanSetting.map_xl)) {
      return { x: 5900, y: 2900 };
    } else {
      return { x: 2900, y: 1400 };
    }
  };

export const getGridSize =
  (getConfigValue: GetWebAppConfigValue, botSize: BotSize) => {
    if (getConfigValue(BooleanSetting.dynamic_map)) {
      // Render the map size according to device axis length.
      return { x: round(botSize.x.value), y: round(botSize.y.value) };
    }
    // Use a default map size.
    return getDefaultAxisLength(getConfigValue);
  };

export const gridOffset: AxisNumberProperty = { x: 50, y: 50 };

@connect(mapStateToProps)
export class FarmDesigner extends React.Component<Props, Partial<State>> {

  initializeSetting =
    (name: keyof State, defaultValue: boolean): boolean => {
      const currentValue = this.props.getConfigValue(name);
      if (isUndefined(currentValue)) {
        this.props.dispatch(setWebAppConfigValue(name, defaultValue));
        return defaultValue;
      } else {
        return !!currentValue;
      }
    }

  getBotOriginQuadrant = (): BotOriginQuadrant => {
    const value = this.props.getConfigValue(NumericSetting.bot_origin_quadrant);
    return isBotOriginQuadrant(value) ? value : 2;
  }

  state: State = {
    legend_menu_open: this.initializeSetting(BooleanSetting.legend_menu_open, false),
    show_plants: this.initializeSetting(BooleanSetting.show_plants, true),
    show_points: this.initializeSetting(BooleanSetting.show_points, true),
    show_spread: this.initializeSetting(BooleanSetting.show_spread, false),
    show_farmbot: this.initializeSetting(BooleanSetting.show_farmbot, true),
    show_images: this.initializeSetting(BooleanSetting.show_images, false),
    show_sensor_readings: this.initializeSetting(BooleanSetting.show_sensor_readings, false),
    bot_origin_quadrant: this.getBotOriginQuadrant(),
    zoom_level: calcZoomLevel(getZoomLevelIndex(this.props.getConfigValue))
  };

  componentDidMount() {
    this.updateBotOriginQuadrant(this.state.bot_origin_quadrant)();
    this.updateZoomLevel(0)();
  }

  toggle = (name: keyof State) => () => {
    const newValue = !this.state[name];
    this.props.dispatch(setWebAppConfigValue(name, newValue));
    this.setState({ [name]: newValue });
  }

  updateBotOriginQuadrant = (payload: BotOriginQuadrant) => () => {
    this.setState({ bot_origin_quadrant: payload });
    this.props.dispatch(setWebAppConfigValue(
      NumericSetting.bot_origin_quadrant, payload));
  }

  updateZoomLevel = (zoomIncrement: number) => () => {
    const newIndex = getZoomLevelIndex(this.props.getConfigValue) + zoomIncrement;
    this.setState({ zoom_level: calcZoomLevel(newIndex) });
    saveZoomLevelIndex(this.props.dispatch, newIndex);
  }

  childComponent(props: Props) {
    return this.props.children || React.createElement(Plants, props);
  }

  get mapOnly() {
    return history.getCurrentLocation().pathname === "/app/designer";
  }

  render() {
    const {
      legend_menu_open,
      show_plants,
      show_points,
      show_spread,
      show_farmbot,
      show_images,
      show_sensor_readings,
      bot_origin_quadrant,
      zoom_level
    } = this.state;

    const botSize = getBotSize(
      this.props.botMcuParams,
      this.props.stepsPerMmXY,
      getDefaultAxisLength(this.props.getConfigValue));

    const stopAtHome = {
      x: !!this.props.botMcuParams.movement_stop_at_home_x,
      y: !!this.props.botMcuParams.movement_stop_at_home_y
    };

    const newestImage = this.props.latestImages[0];
    const oldestImage = last(this.props.latestImages);
    const newestDate = newestImage ? newestImage.body.created_at : "";
    const toOldest = oldestImage && newestDate
      ? Math.abs(moment(oldestImage.body.created_at)
        .diff(moment(newestDate).clone(), "days"))
      : 1;
    const imageAgeInfo = { newestDate, toOldest };

    const displayPanel = this.mapOnly ? "hidden" : "";

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
        showSensorReadings={show_sensor_readings}
        dispatch={this.props.dispatch}
        tzOffset={this.props.tzOffset}
        getConfigValue={this.props.getConfigValue}
        imageAgeInfo={imageAgeInfo} />

      <DesignerNavTabs hidden={!this.mapOnly} />
      <div className={`farm-designer-panels ${displayPanel}`}>
        {this.childComponent(this.props)}
      </div>

      <div
        className={`farm-designer-map ${this.mapOnly ? "" : "panel-open"}`}
        style={{ zoom: zoom_level }}>
        <GardenMap
          showPoints={show_points}
          showPlants={show_plants}
          showSpread={show_spread}
          showFarmbot={show_farmbot}
          showImages={show_images}
          showSensorReadings={show_sensor_readings}
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
          gridSize={getGridSize(this.props.getConfigValue, botSize)}
          gridOffset={gridOffset}
          peripherals={this.props.peripherals}
          eStopStatus={this.props.eStopStatus}
          latestImages={this.props.latestImages}
          cameraCalibrationData={this.props.cameraCalibrationData}
          getConfigValue={this.props.getConfigValue}
          sensorReadings={this.props.sensorReadings}
          timeOffset={this.props.tzOffset}
          sensors={this.props.sensors} />
      </div>

      {this.props.designer.openedSavedGarden &&
        <SavedGardenHUD dispatch={this.props.dispatch} />}
    </div>;
  }
}
