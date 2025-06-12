import React from "react";
import { connect } from "react-redux";
import { GardenMap } from "./map/garden_map";
import {
  FarmDesignerProps, State, BotOriginQuadrant, isBotOriginQuadrant,
} from "./interfaces";
import { mapStateToProps } from "./state_to_props";
import { GardenMapLegend } from "./map/legend/garden_map_legend";
import { NumericSetting, BooleanSetting } from "../session_keys";
import { isUndefined, isFinite, isEqual, filter } from "lodash";
import { AxisNumberProperty, BotSize, MapTransformProps } from "./map/interfaces";
import {
  round, getPanelStatus, MapPanelStatus, mapPanelClassName, getMapPadding,
} from "./map/util";
import {
  calcZoomLevel, getZoomLevelIndex, saveZoomLevelIndex,
} from "./map/zoom";
import { DesignerNavTabs } from "./panel_header";
import {
  setWebAppConfigValue, GetWebAppConfigValue,
} from "../config_storage/actions";
import { SavedGardenHUD } from "../saved_gardens/saved_gardens";
import { calculateImageAgeInfo } from "../photos/photo_filter_settings/util";
import { Xyz } from "farmbot";
import { ProfileViewer } from "./map/profile";
import { ThreeDGardenMap } from "./three_d_garden_map";
import { Outlet } from "react-router";
import { ErrorBoundary } from "../error_boundary";
import { get3DConfigValueFunction } from "../settings/three_d_settings";
import { isDesktop, isMobile } from "../screen_size";
import { NavigationContext } from "../routes_helpers";
import { ThreeDGardenToggle } from "../three_d_garden";

export const getDefaultAxisLength =
  (getConfigValue: GetWebAppConfigValue): Record<Xyz, number> => {
    const mapSizeX = parseInt("" + getConfigValue(NumericSetting.map_size_x));
    const mapSizeY = parseInt("" + getConfigValue(NumericSetting.map_size_y));
    if (isFinite(mapSizeX) && isFinite(mapSizeY)) {
      return { x: mapSizeX, y: mapSizeY, z: 400 };
    }
    return { x: 2900, y: 1230, z: 400 };
  };

export const getGridSize = (
  getConfigValue: GetWebAppConfigValue,
  botSize: BotSize,
): AxisNumberProperty => {
  if (getConfigValue(BooleanSetting.dynamic_map)) {
    // Render the map size according to device axis length.
    return { x: round(botSize.x.value), y: round(botSize.y.value) };
  }
  // Use a default map size.
  const defaultSize = getDefaultAxisLength(getConfigValue);
  return { x: defaultSize.x, y: defaultSize.y };
};

export const gridOffset: AxisNumberProperty = { x: 50, y: 50 };

export class RawFarmDesigner
  extends React.Component<FarmDesignerProps, Partial<State>> {

  initializeSetting =
    (key: keyof State, defaultValue: boolean): boolean => {
      const currentValue = this.props.getConfigValue(key);
      if (isUndefined(currentValue)) {
        this.props.dispatch(setWebAppConfigValue(key, defaultValue));
        return defaultValue;
      } else {
        return !!currentValue;
      }
    };

  getBotOriginQuadrant = (): BotOriginQuadrant => {
    const value = this.props.getConfigValue(NumericSetting.bot_origin_quadrant);
    return isBotOriginQuadrant(value) ? value : 2;
  };

  getState(): State {
    const init = this.initializeSetting;
    return {
      legend_menu_open: init(BooleanSetting.legend_menu_open, false),
      show_plants: init(BooleanSetting.show_plants, true),
      show_points: init(BooleanSetting.show_points, true),
      show_soil_interpolation_map:
        init(BooleanSetting.show_soil_interpolation_map, false),
      show_weeds: init(BooleanSetting.show_weeds, true),
      show_spread: init(BooleanSetting.show_spread, false),
      show_farmbot: init(BooleanSetting.show_farmbot, true),
      show_images: init(BooleanSetting.show_images, false),
      show_zones: init(BooleanSetting.show_zones, false),
      show_sensor_readings: init(BooleanSetting.show_sensor_readings, false),
      show_moisture_interpolation_map:
        init(BooleanSetting.show_moisture_interpolation_map, false),
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
  };

  componentDidUpdate() {
    const filterZoom = (_val: unknown, key: keyof State) => key != "zoom_level";
    if (!isEqual(
      filter(this.state, filterZoom),
      filter(this.getState(), filterZoom))) {
      this.setState(this.getState());
    }
  }

  updateBotOriginQuadrant = (payload: BotOriginQuadrant) => () => {
    this.setState({ bot_origin_quadrant: payload });
    this.props.dispatch(setWebAppConfigValue(
      NumericSetting.bot_origin_quadrant, payload));
  };

  updateZoomLevel = (zoomIncrement: number) => () => {
    const newIndex = getZoomLevelIndex(this.props.getConfigValue) + zoomIncrement;
    this.setState({ zoom_level: calcZoomLevel(newIndex) });
    saveZoomLevelIndex(this.props.dispatch, newIndex);
  };

  /** Assemble the props needed for placement of items in the map. */
  get mapTransformProps(): MapTransformProps {
    return {
      quadrant: this.getBotOriginQuadrant(),
      gridSize: getGridSize(this.props.getConfigValue, this.props.botSize),
      xySwap: !!this.props.getConfigValue(BooleanSetting.xy_swap),
    };
  }

  get mapPanelClassName() { return mapPanelClassName(this.props.designer); }

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate = this.context;

  render() {
    const {
      legend_menu_open,
      show_plants,
      show_points,
      show_soil_interpolation_map,
      show_weeds,
      show_spread,
      show_farmbot,
      show_images,
      show_zones,
      show_sensor_readings,
      show_moisture_interpolation_map,
      zoom_level
    } = this.state;

    const stopAtHome = {
      x: !!this.props.botMcuParams.movement_stop_at_home_x,
      y: !!this.props.botMcuParams.movement_stop_at_home_y
    };

    const mapPadding = getMapPadding(getPanelStatus(this.props.designer));
    const padHeightOffset = mapPadding.top - mapPadding.top / zoom_level;

    const threeDGarden = !!this.props.getConfigValue(BooleanSetting.three_d_garden);

    return <div className="farm-designer">

      <GardenMapLegend
        className={this.mapPanelClassName}
        zoom={this.updateZoomLevel}
        toggle={this.toggle}
        legendMenuOpen={legend_menu_open}
        showPlants={show_plants}
        showPoints={show_points}
        showSoilInterpolationMap={show_soil_interpolation_map}
        showWeeds={show_weeds}
        showSpread={show_spread}
        showFarmbot={show_farmbot}
        showImages={show_images}
        showZones={show_zones}
        showSensorReadings={show_sensor_readings}
        showMoistureInterpolationMap={show_moisture_interpolation_map}
        hasSensorReadings={this.props.sensorReadings.length > 0}
        dispatch={this.props.dispatch}
        timeSettings={this.props.timeSettings}
        getConfigValue={this.props.getConfigValue}
        allPoints={this.props.allPoints}
        sourceFbosConfig={this.props.sourceFbosConfig}
        firmwareConfig={this.props.botMcuParams}
        botLocationData={this.props.botLocationData}
        botSize={this.props.botSize}
        imageAgeInfo={calculateImageAgeInfo(this.props.latestImages)} />

      <DesignerNavTabs
        designer={this.props.designer}
        dispatch={this.props.dispatch}
        hidden={![
          MapPanelStatus.closed,
          MapPanelStatus.mobileClosed,
        ].includes(getPanelStatus(this.props.designer))} />
      <div className={`farm-designer-panels ${this.mapPanelClassName}`}>
        <ErrorBoundary>
          <React.Suspense>
            <Outlet />
          </React.Suspense>
        </ErrorBoundary>
      </div>

      {threeDGarden
        ? <ThreeDGardenMap
          designer={this.props.designer}
          device={this.props.device}
          plants={this.props.plants}
          get3DConfigValue={get3DConfigValueFunction(this.props.farmwareEnvs)}
          sourceFbosConfig={this.props.sourceFbosConfig}
          negativeZ={!!this.props.botMcuParams.movement_home_up_z}
          gridOffset={gridOffset}
          mapTransformProps={this.mapTransformProps}
          botSize={this.props.botSize}
          dispatch={this.props.dispatch}
          curves={this.props.curves}
          mapPoints={this.props.genericPoints}
          weeds={this.props.weeds}
          toolSlots={this.props.toolSlots}
          mountedToolName={this.props.mountedToolInfo.name}
          botPosition={this.props.botLocationData.position}
          peripheralValues={this.props.peripheralValues}
          getWebAppConfigValue={this.props.getConfigValue} />
        : <div
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
            designer={this.props.designer}
            plants={this.props.plants}
            genericPoints={this.props.genericPoints}
            weeds={this.props.weeds}
            allPoints={this.props.allPoints}
            toolSlots={this.props.toolSlots}
            botLocationData={this.props.botLocationData}
            botSize={this.props.botSize}
            stopAtHome={stopAtHome}
            hoveredPlant={this.props.hoveredPlant}
            zoomLvl={zoom_level}
            mapTransformProps={this.mapTransformProps}
            gridOffset={gridOffset}
            peripheralValues={this.props.peripheralValues}
            eStopStatus={this.props.eStopStatus}
            latestImages={this.props.latestImages}
            cameraCalibrationData={this.props.cameraCalibrationData}
            getConfigValue={this.props.getConfigValue}
            sensorReadings={this.props.sensorReadings}
            timeSettings={this.props.timeSettings}
            sensors={this.props.sensors}
            groups={this.props.groups}
            logs={this.props.logs}
            deviceTarget={this.props.deviceTarget}
            mountedToolInfo={this.props.mountedToolInfo}
            visualizedSequenceBody={this.props.visualizedSequenceBody}
            farmwareEnvs={this.props.farmwareEnvs}
            curves={this.props.curves}
            dispatch={this.props.dispatch} />
        </div>}

      {this.props.designer.openedSavedGarden
        && !isMobile()
        && (isDesktop() || !this.props.designer.panelOpen) &&
        <SavedGardenHUD dispatch={this.props.dispatch} />}

      {!threeDGarden &&
        <ProfileViewer
          getConfigValue={this.props.getConfigValue}
          dispatch={this.props.dispatch}
          designer={this.props.designer}
          botSize={this.props.botSize}
          botLocationData={this.props.botLocationData}
          peripheralValues={this.props.peripheralValues}
          negativeZ={!!this.props.botMcuParams.movement_home_up_z}
          sourceFbosConfig={this.props.sourceFbosConfig}
          mountedToolInfo={this.props.mountedToolInfo}
          tools={this.props.tools}
          farmwareEnvs={this.props.farmwareEnvs}
          mapTransformProps={this.mapTransformProps}
          allPoints={this.props.allPoints} />}

      <ThreeDGardenToggle
        navigate={this.navigate}
        dispatch={this.props.dispatch}
        device={this.props.device}
        designer={this.props.designer}
        threeDGarden={threeDGarden} />
    </div>;
  }
}

export const FarmDesigner = connect(mapStateToProps)(RawFarmDesigner);
// eslint-disable-next-line import/no-default-export
export default FarmDesigner;
