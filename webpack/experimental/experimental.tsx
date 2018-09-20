import * as React from "react";
import { FarmDesigner } from "../farm_designer";
import { connect } from "react-redux";
import { Everything } from "../interfaces";
import { CowardlyDictionary } from "../util";

export enum DesignerRouteName {
  DESIGNER_ROOT = "/designer",
  FARM_EVENT_ROOT = "/designer/farm_events",
  FARM_EVENT_ADD = "/designer/farm_events/add",
  FARM_EVENT_SHOW = "/designer/farm_events/:farm_event_id",
  PLANTS_ROOT = "/designer/plants",
  PLANTS_MOVE_TO = "/designer/plants/move_to",
  PLANTS_SAVED_GARDENS = "/designer/plants/saved_gardens",
  PLANTS_SELECT = "/designer/plants/select",
  PLANTS_CREATE_POINT = "/designer/plants/create_point",
  PLANTS_CROP_SEARCH = "/designer/plants/crop_search",
  PLANT_CROP_SEARCH_ADD = "/designer/plants/crop_search/:crop/add",
  PLANT_CROP_SEARCH_SHOW = "/designer/plants/crop_search/:crop",
  PLANT_CROP_SEARCH_EDIT = "/designer/plants/:plant_id/edit",
  PLANT_SHOW = "/designer/plants/:plant_id",
  SAVED_GARDEN_ROOT = "/designer/saved_gardens",
  SAVED_GARDEN_TEMPLATES = "/designer/saved_gardens/templates",
  SAVED_GARDEN_TEMPLATE = "/designer/saved_gardens/templates/:plant_template_id/edit",
  SAVED_GARDEN_TEMPLATE_SHOW = "/designer/saved_gardens/templates/:plant_template_id",
  SAVED_GARDEN_SHOW = "/designer/saved_gardens/:saved_garden_id",
}

export const BIG_LOOKUP: CowardlyDictionary<() => Promise<React.ComponentType>> = {
  "/designer":
    async () => (await import("../farm_designer")).FarmDesigner,
  "/designer/farm_events": async () => {
    return (await import("../farm_designer/farm_events/farm_events")).FarmEvents;
  },
  "/designer/farm_events/add": async () => {
    const mod = (await import("../farm_designer/farm_events/add_farm_event"));
    return mod.AddFarmEvent;
  },
  "/designer/farm_events/:farm_event_id": async () => {
    const mod = await import("../farm_designer/farm_events/edit_farm_event");
    return mod.EditFarmEvent;
  },
  "/designer/plants": async () => {
    const mod = await import("../farm_designer/plants/plant_inventory");
    return mod.Plants;
  },
  "/designer/plants/move_to": async () => {
    const mod = await import("../farm_designer/plants/move_to");
    return mod.MoveTo;
  },
  "/designer/plants/saved_gardens": async () => {
    const mod = await import("../farm_designer/saved_gardens/saved_gardens");
    return mod.SavedGardens;
  },
  "/designer/plants/select": async () => {
    const mod = await import("../farm_designer/plants/select_plants");
    return mod.SelectPlants;
  },
  "/designer/plants/create_point": async () => {
    const mod = await import("../farm_designer/plants/create_points");
    return mod.CreatePoints;
  },
  "/designer/plants/crop_search": async () => {
    const mod = await import("../farm_designer/plants/crop_catalog");
    return mod.CropCatalog;
  },
  "/designer/plants/crop_search/:crop/add": async () => {
    const mod = await import("../farm_designer/plants/add_plant");
    return mod.AddPlant;
  },
  "/designer/plants/crop_search/:crop": async () => {
    const mod = await import("../farm_designer/plants/crop_info");
    return mod.CropInfo;
  },
  "/designer/plants/:plant_id/edit": async () => {
    const mod = await import("../farm_designer/plants/edit_plant_info");
    return mod.EditPlantInfo;
  },
  "/designer/plants/:plant_id": async () => {
    const mod = await import("../farm_designer/plants/plant_info");
    return mod.PlantInfo;
  },
  "/designer/saved_gardens": async () => {
    const mod = await import("../farm_designer/saved_gardens/saved_gardens");
    return mod.SavedGardens;
  },
  "/designer/saved_gardens/templates": async () => {
    const mod = await import("../farm_designer/plants/plant_inventory");
    return mod.Plants;
  },
  "/designer/saved_gardens/templates/:plant_template_id/edit": async () => {
    const mod = await import("../farm_designer/plants/edit_plant_info");
    return mod.EditPlantInfo;
  },
  "/designer/saved_gardens/templates/:plant_template_id": async () => {
    const mod = await import("../farm_designer/plants/plant_info");
    return mod.PlantInfo;
  },
  "/designer/saved_gardens/:saved_garden_id": async () => {
    const mod = await import("../farm_designer/saved_gardens/saved_gardens");
    return mod.SavedGardens;
  },
};

export const DESIGNER_ROUTES: DesignerRouteName[] = Object
  .values(DesignerRouteName);

interface ExperimentalProps { route: string | undefined; }
interface ExperimentalState { MapContents: React.ComponentType; }

type P = ExperimentalProps;
type S = ExperimentalState;

// @connect()ed components don't need props passed to them.
// We can get around type errors by passing empty props.
// Some day, I will migrate to a typescript friendly react-redux alternative.
const NOT_TYPE_SAFE: any = {};

@connect((s: Everything): P => {
  return { route: s.route.$ };
})
export class Experimental extends React.Component<P, S> {
  state: S = { MapContents: () => <div>Loading...</div> };
  Default = () => <div>
    <br />
    <br />
    <br />
    <br />
    <br />
    <br />
    Could not load {this.props.route}...
  </div>;

  render() {
    return <FarmDesigner {...NOT_TYPE_SAFE}>
      <this.Content />
    </FarmDesigner>;
  }
}
