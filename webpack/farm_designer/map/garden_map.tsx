import * as React from "react";
import { t } from "i18next";
import { error } from "farmbot-toastr";
import { Plant, DEFAULT_PLANT_RADIUS } from "../plant";
import { movePlant } from "../actions";
import * as moment from "moment";
import { GardenMapProps, GardenMapState } from "../interfaces";
import { history } from "../../history";
import { initSave, save, edit } from "../../api/crud";
import { TaggedPlantPointer } from "../../resources/tagged_resources";
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
      activeDragXY: { x: undefined, y: undefined, z: undefined }
    });
  }

  startDrag = (): void => this.setState({ isDragging: true });

  get isEditing(): boolean { return location.pathname.includes("edit"); }

  getPlant = (): TaggedPlantPointer | undefined => this.props.selectedPlant;

  handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  handleDragEnter = (e: React.DragEvent<HTMLElement>) => e.preventDefault();

  findCrop(slug?: string) {
    return findBySlug(this.props.designer.cropSearchResults || [], slug);
  }

  handleDrop = (e: React.DragEvent<HTMLElement> | React.MouseEvent<SVGElement>) => {
    e.preventDefault();
    const el = document.querySelector("div.drop-area svg[id='drop-area-svg']");
    const map = document.querySelector(".farm-designer-map");
    const page = document.querySelector(".farm-designer");
    if (el && map && page) {
      const zoomLvl = parseFloat(window.getComputedStyle(map).zoom || DRAG_ERROR);
      const { pageX, pageY } = e;
      const crop = history.getCurrentLocation().pathname.split("/")[5];
      const OFEntry = this.findCrop(crop);
      const params: ScreenToGardenParams = {
        quadrant: this.props.botOriginQuadrant,
        pageX: pageX + page.scrollLeft - this.props.gridOffset.x * zoomLvl,
        pageY: pageY + map.scrollTop * zoomLvl - this.props.gridOffset.y * zoomLvl,
        zoomLvl,
        gridSize: this.props.gridSize
      };
      const { x, y } = translateScreenToGarden(params);
      if (x < 0 || y < 0 || x > this.props.gridSize.x || y > this.props.gridSize.y) {
        error(t("Outside of planting area. Plants must be placed within the grid."));
      } else {
        const p: TaggedPlantPointer = {
          kind: "points",
          uuid: "--never",
          specialStatus: undefined,
          body: Plant({
            x,
            y,
            openfarm_slug: OFEntry.crop.slug,
            name: OFEntry.crop.name || "Mystery Crop",
            created_at: moment().toISOString(),
            radius: DEFAULT_PLANT_RADIUS
          })
        };
        this.props.dispatch(initSave(p));
      }
    } else {
      throw new Error("never");
    }
  }

  click = (e: React.MouseEvent<SVGElement>) => {
    if (history.getCurrentLocation().pathname.split("/")[6] == "add") {
      this.handleDrop(e);
    }
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
  }

  render() {
    const mapSize = getMapSize(this.props.gridSize, this.props.gridOffset);
    const mapTransformProps = {
      quadrant: this.props.botOriginQuadrant,
      gridSize: this.props.gridSize
    };
    return <div
      className="drop-area"
      id="drop-area"
      style={{
        height: mapSize.y + "px", maxHeight: mapSize.y + "px",
        width: mapSize.x + "px", maxWidth: mapSize.x + "px"
      }}
      onDrop={this.handleDrop}
      onDragEnter={this.handleDragEnter}
      onDragOver={this.handleDragOver}>
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
            mapTransformProps={mapTransformProps} />
          <SpreadLayer
            mapTransformProps={mapTransformProps}
            plants={this.props.plants}
            currentPlant={this.getPlant()}
            visible={!!this.props.showSpread} />
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
            activeDragXY={this.state.activeDragXY}
            plantAreaOffset={this.props.gridOffset} />
          <ToolSlotLayer
            mapTransformProps={mapTransformProps}
            visible={!!this.props.showFarmbot}
            slots={this.props.toolSlots} />
          <FarmBotLayer
            mapTransformProps={mapTransformProps}
            visible={!!this.props.showFarmbot}
            botPosition={this.props.botPosition}
            stopAtHome={this.props.stopAtHome}
            botSize={this.props.botSize}
            plantAreaOffset={this.props.gridOffset} />
          <HoveredPlantLayer
            isEditing={this.isEditing}
            mapTransformProps={mapTransformProps}
            currentPlant={this.getPlant()}
            designer={this.props.designer}
            dispatch={this.props.dispatch}
            hoveredPlant={this.props.hoveredPlant} />
        </svg>
      </svg>
    </div>;
  }
}
