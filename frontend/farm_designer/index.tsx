import * as React from "react";
import { connect } from "react-redux";
import { GardenMap } from "./map/garden_map";
import {
  Props, State, BotOriginQuadrant, isBotOriginQuadrant,
} from "./interfaces";
import { mapStateToProps } from "./state_to_props";
import { Plants } from "./plants/plant_inventory";
import { GardenMapLegend } from "./map/legend/garden_map_legend";
import { NumericSetting, BooleanSetting } from "../session_keys";
import { isUndefined, last, isFinite } from "lodash";
import { AxisNumberProperty, BotSize } from "./map/interfaces";
import {
  getBotSize, round, getPanelStatus, MapPanelStatus, mapPanelClassName,
  getMapPadding,
} from "./map/util";
import {
  calcZoomLevel, getZoomLevelIndex, saveZoomLevelIndex,
} from "./map/zoom";
import moment from "moment";
import { DesignerNavTabs } from "./panel_header";
import {
  setWebAppConfigValue, GetWebAppConfigValue,
} from "../config_storage/actions";
import { SavedGardenHUD } from "./saved_gardens/saved_gardens";

export const getDefaultAxisLength =
  (getConfigValue: GetWebAppConfigValue): AxisNumberProperty => {
    const mapSizeX = parseInt("" + getConfigValue(NumericSetting.map_size_x));
    const mapSizeY = parseInt("" + getConfigValue(NumericSetting.map_size_y));
    if (isFinite(mapSizeX) && isFinite(mapSizeY)) {
      return { x: mapSizeX, y: mapSizeY };
    }
    return { x: 2900, y: 1400 };
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

export class RawFarmDesigner extends React.Component<Props, Partial<State>> {

  initializeSetting =
    (key: keyof State, defaultValue: boolean): boolean => {
      const currentValue = this.props.getConfigValue(key);
      if (isUndefined(currentValue)) {
        this.props.dispatch(setWebAppConfigValue(key, defaultValue));
        return defaultValue;
      } else {
        return !!currentValue;
      }
    }

  getBotOriginQuadrant = (): BotOriginQuadrant => {
    const value = this.props.getConfigValue(NumericSetting.bot_origin_quadrant);
    return isBotOriginQuadrant(value) ? value : 2;
  }

  getState(): State {
    const init = this.initializeSetting;
    return {
      legend_menu_open: init(BooleanSetting.legend_menu_open, false),
      show_plants: init(BooleanSetting.show_plants, true),
      show_points: init(BooleanSetting.show_points, true),
      show_weeds: init(BooleanSetting.show_weeds, true),
      show_spread: init(BooleanSetting.show_spread, false),
      show_farmbot: init(BooleanSetting.show_farmbot, true),
      show_images: init(BooleanSetting.show_images, false),
      show_zones: init(BooleanSetting.show_zones, false),
      show_sensor_readings: init(BooleanSetting.show_sensor_readings, false),
      bot_origin_quadrant: this.getBotOriginQuadrant(),
      zoom_level: calcZoomLevel(getZoomLevelIndex(this.props.getConfigValue)),
    };
  }

  state: State = this.getState();

  componentDidMount() {
    this.updateBotOriginQuadrant(this.state.bot_origin_quadrant)();
    this.updateZoomLevel(0)();
  }

  toggle = (key: keyof State) => () => {
    const newValue = !this.state[key];
    this.props.dispatch(setWebAppConfigValue(key, newValue));
    this.setState({ [key]: newValue });
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

  get mapPanelClassName() { return mapPanelClassName(); }

  render() {
    const {
      legend_menu_open,
      show_plants,
      show_points,
      show_weeds,
      show_spread,
      show_farmbot,
      show_images,
      show_zones,
      show_sensor_readings,
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

    const mapPadding = getMapPadding(getPanelStatus());
    const padHeightOffset = mapPadding.top - mapPadding.top / zoom_level;

    return <div className="farm-designer">

      <GardenMapLegend
        className={this.mapPanelClassName}
        zoom={this.updateZoomLevel}
        toggle={this.toggle}
        legendMenuOpen={legend_menu_open}
        showPlants={show_plants}
        showPoints={show_points}
        showWeeds={show_weeds}
        showSpread={show_spread}
        showFarmbot={show_farmbot}
        showImages={show_images}
        showZones={show_zones}
        showSensorReadings={show_sensor_readings}
        hasSensorReadings={this.props.sensorReadings.length > 0}
        dispatch={this.props.dispatch}
        timeSettings={this.props.timeSettings}
        getConfigValue={this.props.getConfigValue}
        imageAgeInfo={imageAgeInfo} />

      <DesignerNavTabs hidden={!(getPanelStatus() === MapPanelStatus.closed)} />
      <div className={`farm-designer-panels ${this.mapPanelClassName}`}>
        {this.childComponent(this.props)}
      </div>

      <div
        className={`farm-designer-map ${this.mapPanelClassName}`}
        style={{
          transform: `scale(${zoom_level})`,
          transformOrigin: `${mapPadding.left}px ${mapPadding.top}px`,
          height: `calc(${100 / zoom_level}% + ${padHeightOffset}px)`
        }}>
        <GardenMap
          showPoints={show_points}
          showPlants={show_plants}
          showWeeds={show_weeds}
          showSpread={show_spread}
          showFarmbot={show_farmbot}
          showImages={show_images}
          showZones={show_zones}
          showSensorReadings={show_sensor_readings}
          selectedPlant={this.props.selectedPlant}
          crops={this.props.crops}
          dispatch={this.props.dispatch}
          designer={this.props.designer}
          plants={this.props.plants}
          genericPoints={this.props.genericPoints}
          weeds={this.props.weeds}
          allPoints={this.props.allPoints}
          toolSlots={this.props.toolSlots}
          botLocationData={this.props.botLocationData}
          botSize={botSize}
          stopAtHome={stopAtHome}
          hoveredPlant={this.props.hoveredPlant}
          zoomLvl={zoom_level}
          botOriginQuadrant={this.getBotOriginQuadrant()}
          gridSize={getGridSize(this.props.getConfigValue, botSize)}
          gridOffset={gridOffset}
          peripherals={this.props.peripherals}
          eStopStatus={this.props.eStopStatus}
          latestImages={this.props.latestImages}
          cameraCalibrationData={this.props.cameraCalibrationData}
          getConfigValue={this.props.getConfigValue}
          sensorReadings={this.props.sensorReadings}
          timeSettings={this.props.timeSettings}
          sensors={this.props.sensors}
          groups={this.props.groups}
          mountedToolName={this.props.mountedToolName}
          shouldDisplay={this.props.shouldDisplay} />
      </div>

      {this.props.designer.openedSavedGarden &&
        <SavedGardenHUD dispatch={this.props.dispatch} />}
    </div>;
  }
}

export const FarmDesigner = connect(mapStateToProps)(RawFarmDesigner);
