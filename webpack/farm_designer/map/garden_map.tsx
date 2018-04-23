import * as React from "react";
import { t } from "i18next";
import { error } from "farmbot-toastr";
import { Plant, DEFAULT_PLANT_RADIUS } from "../plant";
import { movePlant, closePlantInfo, unselectPlant } from "../actions";
import * as moment from "moment";
import { GardenMapProps, GardenMapState } from "../interfaces";
import { getPathArray } from "../../history";
import { initSave, save, edit } from "../../api/crud";
import { TaggedPlantPointer, SpecialStatus } from "../../resources/tagged_resources";
import {
  translateScreenToGarden,
  round,
  ScreenToGardenParams,
  transformXY,
  getMapSize
} from "./util";
import { findBySlug } from "../search_selectors";
import { Grid } from "./grid";
import { MapBackground } from "./map_background";
import {
  PlantLayer,
  SpreadLayer,
  PointLayer,
  ToolSlotLayer,
  FarmBotLayer,
  HoveredPlantLayer,
  DragHelperLayer,
  ImageLayer,
} from "./layers";
import { cachedCrop } from "../../open_farm/icons";
import { AxisNumberProperty, MapTransformProps } from "./interfaces";
import { SelectionBox, SelectionBoxData } from "./selection_box";
import { Actions } from "../../constants";
import { isNumber, last } from "lodash";
import { TargetCoordinate } from "./target_coordinate";
import { DrawnPoint } from "./drawn_point";
import { Bugs, showBugs } from "./easter_eggs/bugs";
import { BooleanSetting } from "../../session_keys";

export enum Mode {
  none = "none",
  boxSelect = "boxSelect",
  clickToAdd = "clickToAdd",
  editPlant = "editPlant",
  addPlant = "addPlant",
  moveTo = "moveTo",
  createPoint = "createPoint",
}

export const getMode = (): Mode => {
  const pathArray = getPathArray();
  if (pathArray) {
    if (pathArray[6] === "add") { return Mode.clickToAdd; }
    if (pathArray[5] === "edit") { return Mode.editPlant; }
    if (pathArray[4] === "select") { return Mode.boxSelect; }
    if (pathArray[4] === "crop_search") { return Mode.addPlant; }
    if (pathArray[4] === "move_to") { return Mode.moveTo; }
    if (pathArray[4] === "create_point") { return Mode.createPoint; }
  }
  return Mode.none;
};

export class GardenMap extends
  React.Component<GardenMapProps, Partial<GardenMapState>> {
  constructor(props: GardenMapProps) {
    super(props);
    this.state = {};
  }

  get mapTransformProps(): MapTransformProps {
    return {
      quadrant: this.props.botOriginQuadrant,
      gridSize: this.props.gridSize,
      xySwap: !!this.props.getConfigValue(BooleanSetting.xy_swap),
    };
  }

  componentWillUnmount() {
    unselectPlant(this.props.dispatch)();
  }

  get isEditing(): boolean { return getMode() === Mode.editPlant; }

  endDrag = () => {
    const p = this.getPlant();
    if (p && this.state.isDragging) {
      this.props.dispatch(edit(p, { x: round(p.body.x), y: round(p.body.y) }));
      this.props.dispatch(save(p.uuid));
    }
    this.setState({
      isDragging: false, pageX: 0, pageY: 0,
      activeDragXY: { x: undefined, y: undefined, z: undefined },
      activeDragSpread: undefined,
      selectionBox: undefined
    });
  }

  setActiveSpread(slug: string) {
    const selectedPlant = this.props.selectedPlant;
    const defaultSpreadCm = selectedPlant ? selectedPlant.body.radius : 0;
    return cachedCrop(slug)
      .then(({ spread }) =>
        this.setState({ activeDragSpread: (spread || defaultSpreadCm) * 10 })
      );
  }

  getGardenCoordinates(
    e: React.DragEvent<HTMLElement> | React.MouseEvent<SVGElement>
  ): AxisNumberProperty | undefined {
    const el = document.querySelector("div.drop-area svg[id='drop-area-svg']");
    const map = document.querySelector(".farm-designer-map");
    const page = document.querySelector(".farm-designer");
    if (el && map && page) {
      const zoomLvl = parseFloat(window.getComputedStyle(map).zoom || "1");
      const params: ScreenToGardenParams = {
        page: { x: e.pageX, y: e.pageY },
        scroll: { left: page.scrollLeft, top: map.scrollTop * zoomLvl },
        mapTransformProps: this.mapTransformProps,
        gridOffset: this.props.gridOffset,
        zoomLvl,
        mapOnly: last(getPathArray()) === "designer",
      };
      return translateScreenToGarden(params);
    } else {
      return undefined;
    }
  }

  startDrag = (e: React.MouseEvent<SVGElement>): void => {
    switch (getMode()) {
      case Mode.editPlant:
        this.setState({ isDragging: true });
        const plant = this.getPlant();
        if (plant) {
          this.setActiveSpread(plant.body.openfarm_slug);
        }
        break;
      case Mode.boxSelect:
        const gardenCoords = this.getGardenCoordinates(e);
        if (gardenCoords) {
          this.setState({
            selectionBox: {
              x0: gardenCoords.x, y0: gardenCoords.y, x1: undefined, y1: undefined
            }
          });
        }
        this.props.dispatch({ type: Actions.SELECT_PLANT, payload: undefined });
        break;
      case Mode.createPoint:
        this.setState({ isDragging: true });
        const center = this.getGardenCoordinates(e);
        if (center) {
          this.props.dispatch({
            type: Actions.SET_CURRENT_POINT_DATA,
            payload: { cx: center.x, cy: center.y, r: 0 }
          });
        }
        break;
    }
  }

  getPlant = (): TaggedPlantPointer | undefined => {
    switch (getMode()) {
      case Mode.boxSelect:
      case Mode.moveTo:
      case Mode.createPoint:
        return undefined;
      default:
        return this.props.selectedPlant;
    }
  }

  handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    switch (getMode()) {
      case Mode.addPlant:
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }
  }

  handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    switch (getMode()) {
      case Mode.addPlant:
        e.preventDefault();
    }
  }

  findCrop(slug?: string) {
    return findBySlug(this.props.designer.cropSearchResults || [], slug);
  }

  handleDrop = (e: React.DragEvent<HTMLElement> | React.MouseEvent<SVGElement>) => {
    e.preventDefault();
    const gardenCoords = this.getGardenCoordinates(e);
    if (gardenCoords) {
      const crop = getPathArray()[5];
      const OFEntry = this.findCrop(crop);
      const { x, y } = gardenCoords;
      if (x < 0 || y < 0 || x > this.props.gridSize.x || y > this.props.gridSize.y) {
        error(t("Outside of planting area. Plants must be placed within the grid."));
      } else {
        const p: TaggedPlantPointer = {
          kind: "Point",
          uuid: "--never",
          specialStatus: SpecialStatus.SAVED,
          body: Plant({
            x,
            y,
            openfarm_slug: OFEntry.crop.slug,
            name: OFEntry.crop.name || "Mystery Crop",
            created_at: moment().toISOString(),
            radius: DEFAULT_PLANT_RADIUS
          })
        };
        if (p.body.name != "name" && p.body.openfarm_slug != "slug") {
          this.props.dispatch(initSave(p));
        }
      }
    } else {
      throw new Error(`Missing 'drop-area-svg', 'farm-designer-map', or
      'farm-designer' while trying to add a plant.`);
    }
  }

  click = (e: React.MouseEvent<SVGElement>) => {
    switch (getMode()) {
      case Mode.clickToAdd:
        this.handleDrop(e);
        break;
      case Mode.moveTo:
        e.preventDefault();
        const gardenCoords = this.getGardenCoordinates(e);
        if (gardenCoords) {
          this.props.dispatch({
            type: Actions.CHOOSE_LOCATION,
            payload: { x: gardenCoords.x, y: gardenCoords.y, z: 0 }
          });
        }
        break;
    }
  }

  getSelected(box: SelectionBoxData) {
    const selected = this.props.plants.filter((p) => {
      if (box &&
        isNumber(box.x0) && isNumber(box.y0) &&
        isNumber(box.x1) && isNumber(box.y1)) {
        return (
          p.body.x >= Math.min(box.x0, box.x1) &&
          p.body.x <= Math.max(box.x0, box.x1) &&
          p.body.y >= Math.min(box.y0, box.y1) &&
          p.body.y <= Math.max(box.y0, box.y1)
        );
      }
    }).map(p => { return p.uuid; });
    return selected.length > 0 ? selected : undefined;
  }

  // tslint:disable-next-line:cyclomatic-complexity
  drag = (e: React.MouseEvent<SVGElement>) => {
    switch (getMode()) {
      case Mode.editPlant:
        const plant = this.getPlant();
        const map = document.querySelector(".farm-designer-map");
        const { gridSize } = this.props;
        const { quadrant, xySwap } = this.mapTransformProps;
        if (this.state.isDragging && plant && map) {
          const zoomLvl = parseFloat(window.getComputedStyle(map).zoom || "1");
          const { qx, qy } = transformXY(e.pageX, e.pageY, this.mapTransformProps);
          const deltaX = Math.round((qx - (this.state.pageX || qx)) / zoomLvl);
          const deltaY = Math.round((qy - (this.state.pageY || qy)) / zoomLvl);
          const dX = xySwap && (quadrant % 2 === 1) ? -deltaX : deltaX;
          const dY = xySwap && (quadrant % 2 === 1) ? -deltaY : deltaY;
          this.setState({
            pageX: qx, pageY: qy,
            activeDragXY: { x: plant.body.x + dX, y: plant.body.y + dY, z: 0 }
          });
          this.props.dispatch(movePlant({ deltaX: dX, deltaY: dY, plant, gridSize }));
        }
        break;
      case Mode.boxSelect:
        if (this.state.selectionBox) {
          const current = this.getGardenCoordinates(e);
          if (current) {
            const box = this.state.selectionBox;
            this.setState({
              selectionBox: {
                x0: box.x0, y0: box.y0, x1: current.x, y1: current.y
              }
            });
            this.props.dispatch({
              type: Actions.SELECT_PLANT,
              payload: this.getSelected(this.state.selectionBox)
            });
          }
        }
        break;
      case Mode.createPoint:
        const edge = this.getGardenCoordinates(e);
        const { currentPoint } = this.props.designer;
        if (edge && currentPoint && !!this.state.isDragging) {
          const { cx, cy } = currentPoint;
          this.props.dispatch({
            type: Actions.SET_CURRENT_POINT_DATA,
            payload: {
              cx, cy,
              r: Math.round(Math.sqrt(
                Math.pow(edge.x - cx, 2) + Math.pow(edge.y - cy, 2))),
            }
          });
        }
        break;
    }
  }

  render() {
    const { gridSize } = this.props;
    const mapSize = getMapSize(this.mapTransformProps, this.props.gridOffset);
    const mapTransformProps = this.mapTransformProps;
    const { xySwap } = mapTransformProps;
    return <div
      className="drop-area"
      style={{
        height: mapSize.h + "px", maxHeight: mapSize.h + "px",
        width: mapSize.w + "px", maxWidth: mapSize.w + "px"
      }}
      onDrop={this.handleDrop}
      onDragEnter={this.handleDragEnter}
      onDragOver={this.handleDragOver}
      onMouseLeave={this.endDrag}
      onMouseUp={this.endDrag}
      onDragEnd={this.endDrag}
      onDragStart={(e) => e.preventDefault()}>
      <svg
        id="map-background-svg">
        <MapBackground
          mapTransformProps={mapTransformProps}
          plantAreaOffset={this.props.gridOffset} />
        <svg
          id="drop-area-svg"
          x={this.props.gridOffset.x} y={this.props.gridOffset.y}
          width={xySwap ? gridSize.y : gridSize.x}
          height={xySwap ? gridSize.x : gridSize.y}
          onMouseUp={this.endDrag}
          onMouseDown={this.startDrag}
          onMouseMove={this.drag}
          onClick={this.click}>
          <ImageLayer
            images={this.props.latestImages}
            cameraCalibrationData={this.props.cameraCalibrationData}
            visible={!!this.props.showImages}
            mapTransformProps={mapTransformProps}
            getConfigValue={this.props.getConfigValue} />
          <Grid
            onClick={closePlantInfo(this.props.dispatch)}
            mapTransformProps={mapTransformProps}
            dispatch={this.props.dispatch} />
          <SpreadLayer
            mapTransformProps={mapTransformProps}
            plants={this.props.plants}
            currentPlant={this.getPlant()}
            visible={!!this.props.showSpread}
            dragging={!!this.state.isDragging}
            zoomLvl={this.props.zoomLvl}
            activeDragXY={this.state.activeDragXY}
            activeDragSpread={this.state.activeDragSpread}
            editing={this.isEditing} />
          <PointLayer
            mapTransformProps={mapTransformProps}
            visible={!!this.props.showPoints}
            points={this.props.points} />
          <PlantLayer
            mapTransformProps={mapTransformProps}
            dispatch={this.props.dispatch}
            visible={!!this.props.showPlants}
            plants={this.props.plants}
            crops={this.props.crops}
            currentPlant={this.getPlant()}
            dragging={!!this.state.isDragging}
            editing={this.isEditing}
            selectedForDel={this.props.designer.selectedPlants}
            zoomLvl={this.props.zoomLvl}
            activeDragXY={this.state.activeDragXY} />
          <ToolSlotLayer
            mapTransformProps={mapTransformProps}
            visible={!!this.props.showFarmbot}
            slots={this.props.toolSlots}
            dispatch={this.props.dispatch} />
          <FarmBotLayer
            mapTransformProps={mapTransformProps}
            visible={!!this.props.showFarmbot}
            botLocationData={this.props.botLocationData}
            stopAtHome={this.props.stopAtHome}
            botSize={this.props.botSize}
            plantAreaOffset={this.props.gridOffset}
            peripherals={this.props.peripherals}
            eStopStatus={this.props.eStopStatus} />
          <HoveredPlantLayer
            visible={!!this.props.showPlants}
            isEditing={this.isEditing}
            mapTransformProps={mapTransformProps}
            currentPlant={this.getPlant()}
            designer={this.props.designer}
            hoveredPlant={this.props.hoveredPlant}
            dragging={!!this.state.isDragging} />
          <DragHelperLayer
            mapTransformProps={mapTransformProps}
            currentPlant={this.getPlant()}
            dragging={!!this.state.isDragging}
            editing={this.isEditing}
            zoomLvl={this.props.zoomLvl}
            activeDragXY={this.state.activeDragXY}
            plantAreaOffset={this.props.gridOffset} />
          {this.state.selectionBox &&
            <SelectionBox
              selectionBox={this.state.selectionBox}
              mapTransformProps={mapTransformProps} />}
          {this.props.designer.chosenLocation &&
            <TargetCoordinate
              chosenLocation={this.props.designer.chosenLocation}
              mapTransformProps={mapTransformProps} />}
          {this.props.designer.currentPoint &&
            <DrawnPoint
              data={this.props.designer.currentPoint}
              key={"currentPoint"}
              mapTransformProps={mapTransformProps} />}
          {showBugs() && <Bugs mapTransformProps={mapTransformProps}
            botSize={this.props.botSize} />}
        </svg>
      </svg>
    </div>;
  }
}
