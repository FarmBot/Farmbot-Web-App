import * as React from "react";
import { RouteConfig } from "takeme";
import { FarmDesigner } from "../farm_designer";
// import { connect } from "react-redux";
// import { Everything } from "../interfaces";

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

export const DESIGNER_ROUTES: DesignerRouteName[] =
  Object.values(DesignerRouteName);

interface ExperimentalProps {
  route: RouteConfig;
  localConfig: {};
}

interface ExperimentalState {
  MapContents: React.ComponentType;
}

type P = ExperimentalProps;

type S = ExperimentalState;

// @connect()ed components don't need props passed to them.
// We can get around type errors by passing empty props.
// Some day, I will migrate to a typescript friendly react-redux alternative.
const NOT_TYPE_SAFE: any = {};

export class Experimental extends React.Component<P, S> {
  state: S = { MapContents: () => <div>Loading...</div> };

  render() {
    return <FarmDesigner {...NOT_TYPE_SAFE}>
      <this.state.MapContents />
    </FarmDesigner>;
  }
}
