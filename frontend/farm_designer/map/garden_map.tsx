import * as React from "react";
import { BooleanSetting } from "../../session_keys";
import { closePlantInfo, unselectPlant } from "../actions";
import {
  MapTransformProps, TaggedPlant, Mode, AxisNumberProperty
} from "./interfaces";
import { GardenMapProps, GardenMapState } from "../interfaces";
import { getMapSize, getMode, getGardenCoordinates } from "./util";
import {
  Grid, MapBackground,
  TargetCoordinate,
  SelectionBox, resizeBox, startNewSelectionBox
} from "./background";
import {
  PlantLayer,
  SpreadLayer,
  PointLayer,
  ToolSlotLayer,
  FarmBotLayer,
  ImageLayer,
  SensorReadingsLayer,
} from "./layers";
import { HoveredPlant, ActivePlantDragHelper } from "./active_plant";
import { DrawnPoint, startNewPoint, resizePoint } from "./drawn_point";
import { Bugs, showBugs } from "./easter_eggs/bugs";
import {
  dropPlant, dragPlant, beginPlantDrag, maybeSavePlantLocation
} from "./layers/plants/plant_actions";
import { chooseLocation } from "../move_to";

export class GardenMap extends
  React.Component<GardenMapProps, Partial<GardenMapState>> {
  state: Partial<GardenMapState> = {};
  constructor(props: GardenMapProps) {
    super(props);
    this.state = {};
  }

  componentWillUnmount() {
    // Clear plant selection when navigating away from the designer.
    unselectPlant(this.props.dispatch)();
  }

  /** Assemble the props needed for placement of items in the map. */
  get mapTransformProps(): MapTransformProps {
    return {
      quadrant: this.props.botOriginQuadrant,
      gridSize: this.props.gridSize,
      xySwap: !!this.props.getConfigValue(BooleanSetting.xy_swap),
    };
  }

  get mapSize() {
    return getMapSize(this.mapTransformProps, this.props.gridOffset);
  }
  get xySwap() { return this.mapTransformProps.xySwap; }

  /** Currently editing a plant? */
  get isEditing(): boolean { return getMode() === Mode.editPlant; }

  /** Display plant animations? */
  get animate(): boolean {
    return !this.props.getConfigValue(BooleanSetting.disable_animations);
  }

  /** Save the current plant (if needed) and reset drag state. */
  endDrag = () => {
    maybeSavePlantLocation({
      plant: this.getPlant(),
      isDragging: this.state.isDragging,
      dispatch: this.props.dispatch,
    });
    this.setState({
      isDragging: false, qPageX: 0, qPageY: 0,
      activeDragXY: { x: undefined, y: undefined, z: undefined },
      activeDragSpread: undefined,
      selectionBox: undefined
    });
  }

  getGardenCoordinates =
    (e: React.DragEvent<HTMLElement> | React.MouseEvent<SVGElement>):
      AxisNumberProperty | undefined => {
      return getGardenCoordinates({
        mapTransformProps: this.mapTransformProps,
        gridOffset: this.props.gridOffset,
        pageX: e.pageX,
        pageY: e.pageY,
      });
    };

  setMapState = (x: Partial<GardenMapState>) => this.setState(x);

  /** Map drag start actions. */
  startDrag = (e: React.MouseEvent<SVGElement>): void => {
    switch (getMode()) {
      case Mode.editPlant:
        beginPlantDrag({
          plant: this.getPlant(),
          setMapState: this.setMapState,
          selectedPlant: this.props.selectedPlant,
        });
        break;
      case Mode.createPoint:
        startNewPoint({
          gardenCoords: this.getGardenCoordinates(e),
          dispatch: this.props.dispatch,
          setMapState: this.setMapState,
        });
        break;
      case Mode.clickToAdd:
        break;
      case Mode.boxSelect:
      default:
        startNewSelectionBox({
          gardenCoords: this.getGardenCoordinates(e),
          setMapState: this.setMapState,
          dispatch: this.props.dispatch,
        });
        break;
    }
  }

  /** Return the selected plant, mode-allowing. */
  getPlant = (): TaggedPlant | undefined => {
    switch (getMode()) {
      case Mode.boxSelect:
      case Mode.moveTo:
      case Mode.createPoint:
        return undefined; // For modes without plant interaction
      default:
        return this.props.selectedPlant;
    }
  }

  handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    switch (getMode()) {
      case Mode.addPlant:
      case Mode.clickToAdd:
        e.preventDefault(); // Allows dragged-in plants to be placed in the map
        e.dataTransfer.dropEffect = "move";
    }
  }

  handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    switch (getMode()) {
      case Mode.addPlant:
        e.preventDefault();
    }
  }

  handleDrop =
    (e: React.DragEvent<HTMLElement> | React.MouseEvent<SVGElement>) => {
      e.preventDefault();
      dropPlant({
        gardenCoords: this.getGardenCoordinates(e),
        cropSearchResults: this.props.designer.cropSearchResults,
        openedSavedGarden: this.props.designer.openedSavedGarden,
        gridSize: this.props.gridSize,
        dispatch: this.props.dispatch,
      });
    };

  click = (e: React.MouseEvent<SVGElement>) => {
    switch (getMode()) {
      case Mode.clickToAdd:
        // Create a new plant in the map
        this.handleDrop(e);
        break;
      case Mode.moveTo:
        e.preventDefault();
        chooseLocation({
          gardenCoords: this.getGardenCoordinates(e),
          dispatch: this.props.dispatch
        });
        break;
    }
  }

  /** Map drag actions. */
  drag = (e: React.MouseEvent<SVGElement>) => {
    switch (getMode()) {
      case Mode.editPlant:
        dragPlant({
          getPlant: this.getPlant,
          mapTransformProps: this.mapTransformProps,
          isDragging: this.state.isDragging,
          dispatch: this.props.dispatch,
          setMapState: this.setMapState,
          gridSize: this.props.gridSize,
          qPageX: this.state.qPageX,
          qPageY: this.state.qPageY,
          pageX: e.pageX,
          pageY: e.pageY,
        });
        break;
      case Mode.createPoint:
        resizePoint({
          gardenCoords: this.getGardenCoordinates(e),
          currentPoint: this.props.designer.currentPoint,
          dispatch: this.props.dispatch,
          isDragging: this.state.isDragging,
        });
        break;
      case Mode.boxSelect:
      default:
        resizeBox({
          selectionBox: this.state.selectionBox,
          plants: this.props.plants,
          gardenCoords: this.getGardenCoordinates(e),
          setMapState: this.setMapState,
          dispatch: this.props.dispatch,
        });
        break;
    }
  }

  /** Return to garden (unless selecting more plants). */
  closePanel = () => {
    switch (getMode()) {
      case Mode.boxSelect:
        return this.props.designer.selectedPlants
          ? () => { }
          : closePlantInfo(this.props.dispatch);
      default:
        return closePlantInfo(this.props.dispatch);
    }
  }

  mapDropAreaProps = () => ({
    onDrop: this.handleDrop,
    onDragEnter: this.handleDragEnter,
    onDragOver: this.handleDragOver,
    onMouseLeave: this.endDrag,
    onMouseUp: this.endDrag,
    onDragEnd: this.endDrag,
    onDragStart: (e: React.DragEvent<HTMLElement>) => e.preventDefault(),
    style: {
      height: this.mapSize.h + "px", maxHeight: this.mapSize.h + "px",
      width: this.mapSize.w + "px", maxWidth: this.mapSize.w + "px"
    },
  });
  MapBackground = () => <MapBackground
    templateView={!!this.props.designer.openedSavedGarden}
    mapTransformProps={this.mapTransformProps}
    plantAreaOffset={this.props.gridOffset} />
  svgDropAreaProps = () => ({
    x: this.props.gridOffset.x,
    y: this.props.gridOffset.y,
    width: this.xySwap ? this.props.gridSize.y : this.props.gridSize.x,
    height: this.xySwap ? this.props.gridSize.x : this.props.gridSize.y,
    onMouseUp: this.endDrag,
    onMouseDown: this.startDrag,
    onMouseMove: this.drag,
    onClick: this.click,
  });
  ImageLayer = () => <ImageLayer
    images={this.props.latestImages}
    cameraCalibrationData={this.props.cameraCalibrationData}
    visible={!!this.props.showImages}
    mapTransformProps={this.mapTransformProps}
    imageFilterBegin={
      (this.props.getConfigValue("photo_filter_begin") || "").toString()}
    imageFilterEnd={
      (this.props.getConfigValue("photo_filter_end") || "").toString()} />
  Grid = () => <Grid
    onClick={this.closePanel()}
    mapTransformProps={this.mapTransformProps} />
  SensorReadingsLayer = () => <SensorReadingsLayer
    visible={!!this.props.showSensorReadings}
    sensorReadings={this.props.sensorReadings}
    mapTransformProps={this.mapTransformProps}
    timeSettings={this.props.timeSettings}
    sensors={this.props.sensors} />
  SpreadLayer = () => <SpreadLayer
    mapTransformProps={this.mapTransformProps}
    plants={this.props.plants}
    currentPlant={this.getPlant()}
    visible={!!this.props.showSpread}
    dragging={!!this.state.isDragging}
    zoomLvl={this.props.zoomLvl}
    activeDragXY={this.state.activeDragXY}
    activeDragSpread={this.state.activeDragSpread}
    editing={this.isEditing}
    animate={this.animate} />
  PointLayer = () => <PointLayer
    mapTransformProps={this.mapTransformProps}
    visible={!!this.props.showPoints}
    points={this.props.points} />
  PlantLayer = () => <PlantLayer
    mapTransformProps={this.mapTransformProps}
    dispatch={this.props.dispatch}
    visible={!!this.props.showPlants}
    plants={this.props.plants}
    currentPlant={this.getPlant()}
    dragging={!!this.state.isDragging}
    editing={this.isEditing}
    selectedForDel={this.props.designer.selectedPlants}
    zoomLvl={this.props.zoomLvl}
    activeDragXY={this.state.activeDragXY}
    animate={this.animate} />
  ToolSlotLayer = () => <ToolSlotLayer
    mapTransformProps={this.mapTransformProps}
    visible={!!this.props.showFarmbot}
    slots={this.props.toolSlots} />
  FarmBotLayer = () => <FarmBotLayer
    mapTransformProps={this.mapTransformProps}
    visible={!!this.props.showFarmbot}
    botLocationData={this.props.botLocationData}
    stopAtHome={this.props.stopAtHome}
    botSize={this.props.botSize}
    plantAreaOffset={this.props.gridOffset}
    peripherals={this.props.peripherals}
    eStopStatus={this.props.eStopStatus}
    getConfigValue={this.props.getConfigValue} />
  HoveredPlant = () => <HoveredPlant
    visible={!!this.props.showPlants}
    spreadLayerVisible={!!this.props.showSpread}
    isEditing={this.isEditing}
    mapTransformProps={this.mapTransformProps}
    currentPlant={this.getPlant()}
    designer={this.props.designer}
    hoveredPlant={this.props.hoveredPlant}
    dragging={!!this.state.isDragging}
    animate={this.animate} />
  DragHelper = () => <ActivePlantDragHelper
    mapTransformProps={this.mapTransformProps}
    currentPlant={this.getPlant()}
    dragging={!!this.state.isDragging}
    editing={this.isEditing}
    zoomLvl={this.props.zoomLvl}
    activeDragXY={this.state.activeDragXY}
    plantAreaOffset={this.props.gridOffset} />
  SelectionBox = () => <SelectionBox
    selectionBox={this.state.selectionBox}
    mapTransformProps={this.mapTransformProps} />
  TargetCoordinate = () => <TargetCoordinate
    chosenLocation={this.props.designer.chosenLocation}
    mapTransformProps={this.mapTransformProps} />
  DrawnPoint = () => <DrawnPoint
    data={this.props.designer.currentPoint}
    key={"currentPoint"}
    mapTransformProps={this.mapTransformProps} />
  Bugs = () => showBugs() ? <Bugs mapTransformProps={this.mapTransformProps}
    botSize={this.props.botSize} /> : <g />

  /** Render layers in order from back to front. */
  render() {
    return <div className={"drop-area"} {...this.mapDropAreaProps()}>
      <svg id={"map-background-svg"}>
        <this.MapBackground />
        <svg className={"drop-area-svg"} {...this.svgDropAreaProps()}>
          <this.ImageLayer />
          <this.Grid />
          <this.SensorReadingsLayer />
          <this.SpreadLayer />
          <this.PointLayer />
          <this.PlantLayer />
          <this.ToolSlotLayer />
          <this.FarmBotLayer />
          <this.HoveredPlant />
          <this.DragHelper />
          <this.SelectionBox />
          <this.TargetCoordinate />
          <this.DrawnPoint />
          <this.Bugs />
        </svg>
      </svg>
    </div>;
  }
}
