import * as React from "react";
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
  getXYFromQuadrant
} from "./util";
import { findBySlug } from "../search_selectors";
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

  handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const el = document.querySelector("#drop-area > svg");
    const map = document.querySelector(".farm-designer-map");
    const page = document.querySelector(".farm-designer");
    if (el && map && page) {
      const zoomLvl = parseFloat(window.getComputedStyle(map).zoom || DRAG_ERROR);
      const { pageX, pageY } = e;
      // let box = el.getBoundingClientRect();
      const crop = history.getCurrentLocation().pathname.split("/")[5];
      const OFEntry = this.findCrop(crop);
      const params: ScreenToGardenParams = {
        quadrant: this.props.designer.botOriginQuadrant,
        pageX: pageX + page.scrollLeft,
        pageY: pageY + map.scrollTop * zoomLvl,
        zoomLvl
      };
      const { x, y } = translateScreenToGarden(params);
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
    } else {
      throw new Error("never");
    }
  }

  drag = (e: React.MouseEvent<SVGElement>) => {
    const plant = this.getPlant();
    const map = document.querySelector(".farm-designer-map");
    const { botOriginQuadrant } = this.props.designer;
    if (this.isEditing && this.state.isDragging && plant && map) {
      const zoomLvl = parseFloat(window.getComputedStyle(map).zoom || DRAG_ERROR);
      const { qx, qy } = getXYFromQuadrant(e.pageX, e.pageY, botOriginQuadrant);
      const deltaX = Math.round((qx - (this.state.pageX || qx)) / zoomLvl);
      const deltaY = Math.round((qy - (this.state.pageY || qy)) / zoomLvl);
      this.setState({
        pageX: qx, pageY: qy,
        activeDragXY: { x: plant.body.x + deltaX, y: plant.body.y + deltaY, z: 0 }
      });
      this.props.dispatch(movePlant({ deltaX, deltaY, plant }));
    }
  }

  render() {
    return <div
      className="drop-area"
      id="drop-area"
      onDrop={this.handleDrop}
      onDragEnter={this.handleDragEnter}
      onDragOver={this.handleDragOver}>
      <svg
        id="drop-area-svg"
        onMouseUp={this.endDrag}
        onMouseDown={this.startDrag}
        onMouseMove={this.drag}>
        <SpreadLayer
          botOriginQuadrant={this.props.designer.botOriginQuadrant}
          plants={this.props.plants}
          currentPlant={this.getPlant()}
          visible={!!this.props.showSpread} />
        <PointLayer
          botOriginQuadrant={this.props.designer.botOriginQuadrant}
          visible={!!this.props.showPoints}
          points={this.props.points} />
        <PlantLayer
          botOriginQuadrant={this.props.designer.botOriginQuadrant}
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
          botOriginQuadrant={this.props.designer.botOriginQuadrant}
          visible={!!this.props.showFarmbot}
          slots={this.props.toolSlots} />
        <FarmBotLayer
          botOriginQuadrant={this.props.designer.botOriginQuadrant}
          visible={!!this.props.showFarmbot}
          botPosition={this.props.botPosition} />
        <HoveredPlantLayer
          isEditing={this.isEditing}
          botOriginQuadrant={this.props.designer.botOriginQuadrant}
          currentPlant={this.getPlant()}
          designer={this.props.designer}
          dispatch={this.props.dispatch}
          hoveredPlant={this.props.hoveredPlant} />
      </svg>
    </div>;
  }
}
