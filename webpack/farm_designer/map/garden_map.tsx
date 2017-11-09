import * as React from "react";
import { t } from "i18next";
import { error } from "farmbot-toastr";
import { Plant, DEFAULT_PLANT_RADIUS } from "../plant";
import { movePlant } from "../actions";
import * as moment from "moment";
import { GardenMapProps, GardenMapState } from "../interfaces";
import { history } from "../../history";
import { initSave, save, edit } from "../../api/crud";
import { TaggedPlantPointer, SpecialStatus } from "../../resources/tagged_resources";
import {
  translateScreenToGarden,
  round,
  ScreenToGardenParams,
  getXYFromQuadrant,
  getMapSize
} from "./util";
import { findBySlug } from "../search_selectors";
import { Grid } from "./grid";
import { MapBackground } from "./map_background";
import { PlantLayer } from "./layers/plant_layer";
import { PointLayer } from "./layers/point_layer";
import { SpreadLayer } from "./layers/spread_layer";
import { ToolSlotLayer } from "./layers/tool_slot_layer";
import { HoveredPlantLayer } from "./layers/hovered_plant_layer";
import { FarmBotLayer } from "./layers/farmbot_layer";
import { cachedCrop } from "../../open_farm/index";
import { DragHelperLayer } from "./layers/drag_helper_layer";
import { AxisNumberProperty } from "./interfaces";
import { SelectionBox, SelectionBoxData } from "./selection_box";

const DRAG_ERROR = `ERROR - Couldn't get zoom level of garden map, check the
  handleDrop() or drag() method in garden_map.tsx`;

export class GardenMap extends
  React.Component<GardenMapProps, Partial<GardenMapState>> {
  constructor() {
    super();
    this.state = {};
  }

  endDrag = () => {
    const p = this.getPlant();
    if (p) {
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
      const zoomLvl = parseFloat(window.getComputedStyle(map).zoom || DRAG_ERROR);
      const { pageX, pageY } = e;
      const params: ScreenToGardenParams = {
        quadrant: this.props.botOriginQuadrant,
        pageX: pageX + page.scrollLeft - this.props.gridOffset.x * zoomLvl,
        pageY: pageY + map.scrollTop * zoomLvl - this.props.gridOffset.y * zoomLvl,
        zoomLvl,
        gridSize: this.props.gridSize
      };
      return translateScreenToGarden(params);
    } else {
      return undefined;
    }
  }

  startDrag = (e: React.MouseEvent<SVGElement>): void => {
    if (this.isEditing) {
      this.setState({ isDragging: true });
      const plant = this.getPlant();
      if (plant) {
        this.setActiveSpread(plant.body.openfarm_slug);
      }
    }
    if (location.pathname.includes("select")) {
      const gardenCoords = this.getGardenCoordinates(e);
      if (gardenCoords) {
        this.setState({
          selectionBox: {
            x0: gardenCoords.x, y0: gardenCoords.y, x1: undefined, y1: undefined
          }
        });
      }
      this.props.dispatch({ type: "SELECT_PLANT", payload: undefined });
    }
  }

  get isEditing(): boolean { return location.pathname.includes("edit"); }

  getPlant = (): TaggedPlantPointer | undefined =>
    history.getCurrentLocation().pathname.split("/")[4] != "select"
      ? this.props.selectedPlant
      : undefined;

  handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    if (!this.isEditing &&
      history.getCurrentLocation().pathname.split("/")[4] == "crop_search") {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  }

  handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
    if (history.getCurrentLocation().pathname.split("/")[4] == "crop_search") {
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
      const crop = history.getCurrentLocation().pathname.split("/")[5];
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
    if (history.getCurrentLocation().pathname.split("/")[6] == "add") {
      // In 'click-to-add' mode
      this.handleDrop(e);
    }
  }

  getSelected(box: SelectionBoxData) {
    const selected = this.props.plants.filter((p) => {
      if (box && box.x0 && box.y0 && box.x1 && box.y1) {
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

  drag = (e: React.MouseEvent<SVGElement>) => {
    const plant = this.getPlant();
    const map = document.querySelector(".farm-designer-map");
    const { botOriginQuadrant, gridSize } = this.props;
    if (this.isEditing && this.state.isDragging && plant && map) {
      const zoomLvl = parseFloat(window.getComputedStyle(map).zoom || DRAG_ERROR);
      const { qx, qy } = getXYFromQuadrant(
        e.pageX, e.pageY, botOriginQuadrant, gridSize);
      const deltaX = Math.round((qx - (this.state.pageX || qx)) / zoomLvl);
      const deltaY = Math.round((qy - (this.state.pageY || qy)) / zoomLvl);
      this.setState({
        pageX: qx, pageY: qy,
        activeDragXY: { x: plant.body.x + deltaX, y: plant.body.y + deltaY, z: 0 }
      });
      this.props.dispatch(movePlant({ deltaX, deltaY, plant, gridSize }));
    }
    if (this.state.selectionBox && location.pathname.includes("select")) {
      const current = this.getGardenCoordinates(e);
      if (current) {
        const box = this.state.selectionBox;
        this.props.dispatch({
          type: "SELECT_PLANT",
          payload: this.getSelected(this.state.selectionBox)
        });
        this.setState({
          selectionBox: { x0: box.x0, y0: box.y0, x1: current.x, y1: current.y }
        });
      }
    }
  }

  render() {
    const mapSize = getMapSize(this.props.gridSize, this.props.gridOffset);
    const mapTransformProps = {
      quadrant: this.props.botOriginQuadrant,
      gridSize: this.props.gridSize
    };
    return <div
      className="drop-area"
      style={{
        height: mapSize.y + "px", maxHeight: mapSize.y + "px",
        width: mapSize.x + "px", maxWidth: mapSize.x + "px"
      }}
      onDrop={this.handleDrop}
      onDragEnter={this.handleDragEnter}
      onDragOver={this.handleDragOver}
      onMouseLeave={this.endDrag}
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
          width={this.props.gridSize.x} height={this.props.gridSize.y}
          onMouseUp={this.endDrag}
          onMouseDown={this.startDrag}
          onMouseMove={this.drag}
          onClick={this.click}>
          <Grid
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
            editing={!!this.isEditing} />
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
            editing={!!this.isEditing}
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
            editing={!!this.isEditing}
            zoomLvl={this.props.zoomLvl}
            activeDragXY={this.state.activeDragXY}
            plantAreaOffset={this.props.gridOffset} />
          {this.state.selectionBox &&
            <SelectionBox
              selectionBox={this.state.selectionBox}
              mapTransformProps={mapTransformProps} />}
        </svg>
      </svg>
    </div>;
  }
}
