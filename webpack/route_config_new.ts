import { RouteConfig } from "takeme";

interface FarmBotRoute<T> { $: string; enter: () => Promise<T>; key: keyof T; }

export const uhoh = () => console.error("Rick, it's broke!");

const rc = <T>(i: FarmBotRoute<T>): RouteConfig => {
  const { $, enter, key } = i;
  return { $, enter: () => enter().then(x => console.dir(x[key]), uhoh) };
};

export const ROUTES: RouteConfig[] = [
  rc({
    $: "app/account",
    enter: () => import("./account/index"),
    key: "Account"
  }),
  rc({
    $: "app/controls",
    enter: () => import("./controls/controls"),
    key: "Controls"
  }),
  rc({
    $: "app/designer/farm_events",
    enter: () => import("./farm_designer/farm_events/farm_events"),
    key: "FarmEvents"
  }),
  rc({
    $: "app/designer/farm_events/:farm_event_id",
    enter: () => import("./farm_designer/farm_events/edit_farm_event"),
    key: "EditFarmEvent"
  }),
  rc({
    $: "app/designer/farm_events/add",
    enter: () => import("./farm_designer/farm_events/add_farm_event"),
    key: "AddFarmEvent"
  }),
  rc({
    $: "app/designer/plants",
    enter: () => import("./farm_designer/plants/plant_inventory"),
    key: "Plants"
  }),
  rc({
    $: "app/designer/plants/:plant_id",
    enter: () => import("./farm_designer/plants/plant_info"),
    key: "PlantInfo"
  }),
  rc({
    $: "app/designer/plants/:plant_id/edit",
    enter: () => import("./farm_designer/plants/edit_plant_info"),
    key: "EditPlantInfo"
  }),
  rc({
    $: "app/designer/plants/create_point",
    enter: () => import("./farm_designer/plants/create_points"),
    key: "CreatePoints"
  }),
  rc({
    $: "app/designer/plants/crop_search",
    enter: () => import("./farm_designer/plants/crop_catalog"),
    key: "CropCatalog"
  }),
  rc({
    $: "app/designer/plants/crop_search/:crop",
    enter: () => import("./farm_designer/plants/crop_info"),
    key: "CropInfo"
  }),
  rc({
    $: "app/designer/plants/crop_search/:crop/add",
    enter: () => import("./farm_designer/plants/add_plant"),
    key: "AddPlant"
  }),
  rc({
    $: "app/designer/plants/move_to",
    enter: () => import("./farm_designer/plants/move_to"),
    key: "MoveTo"
  }),
  rc({
    $: "app/designer/plants/saved_gardens",
    enter: () => import("./farm_designer/saved_gardens/saved_gardens"),
    key: "SavedGardens"
  }),
  rc({
    $: "app/designer/plants/select",
    enter: () => import("./farm_designer/plants/select_plants"),
    key: "SelectPlants"
  }),
  rc({
    $: "app/device",
    enter: () => import("./devices/devices"),
    key: "Devices"
  }),
  rc({
    $: "app/farmware",
    enter: () => import("./farmware/index"),
    key: "FarmwarePage"
  }),
  rc({
    $: "app/farmware/:farmware",
    enter: () => import("./farmware/index"),
    key: "FarmwarePage"
  }),
  rc({
    $: "app/logs",
    enter: () => import("./logs/index"),
    key: "Logs"
  }),
  rc({
    $: "app/regimens",
    enter: () => import("./regimens/index"),
    key: "Regimens"
  }),
  rc({
    $: "app/regimens/:regimen",
    enter: () => import("./regimens/index"),
    key: "Regimens"
  }),
  rc({
    $: "app/sequences",
    enter: () => import("./sequences/sequences"),
    key: "Sequences"
  }),
  rc({
    $: "app/sequences/:sequence",
    enter: () => import("./sequences/sequences"),
    key: "Sequences"
  }),
  rc({
    $: "app/tools",
    enter: () => import("./tools/index"),
    key: "Tools"
  }),
  rc({
    $: "*",
    enter: () => import("./404"),
    key: "FourOhFour"
  }),
];
