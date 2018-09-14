import { RouteConfig } from "takeme";
import { Apology } from "./apology";

interface FarmBotRoute<T> { $: string; enter: () => Promise<T>; key: keyof T; }

export const uhoh = () => console.error("Rick, it's broke!");

const rc =
  <T>(i: FarmBotRoute<T>) => (callback: Function): RouteConfig => {
    const { $, enter, key } = i;
    return {
      $,
      enter: async (info) => {
        try {
          callback((await enter())[key], info);
        } catch (e) {
          console.error(e);
          callback(Apology, info);
        }
      }
    };
  };

/** Bind the route to a callback by calling in a function that passes the
  callback in as the first argument
 */
export const UNBOUND_ROUTES = [
  rc({
    $: "/account",
    enter: () => import("./account/index"),
    key: "Account"
  }),
  rc({
    $: "/controls",
    enter: () => import("./controls/controls"),
    key: "Controls"
  }),
  rc({
    $: "/designer/farm_events",
    enter: () => import("./farm_designer/farm_events/farm_events"),
    key: "FarmEvents"
  }),
  rc({
    $: "/designer/farm_events/:farm_event_id",
    enter: () => import("./farm_designer/farm_events/edit_farm_event"),
    key: "EditFarmEvent"
  }),
  rc({
    $: "/designer/farm_events/add",
    enter: () => import("./farm_designer/farm_events/add_farm_event"),
    key: "AddFarmEvent"
  }),
  rc({
    $: "/designer/plants",
    enter: () => import("./farm_designer/plants/plant_inventory"),
    key: "Plants"
  }),
  rc({
    $: "/designer/plants/:plant_id",
    enter: () => import("./farm_designer/plants/plant_info"),
    key: "PlantInfo"
  }),
  rc({
    $: "/designer/plants/:plant_id/edit",
    enter: () => import("./farm_designer/plants/edit_plant_info"),
    key: "EditPlantInfo"
  }),
  rc({
    $: "/designer/plants/create_point",
    enter: () => import("./farm_designer/plants/create_points"),
    key: "CreatePoints"
  }),
  rc({
    $: "/designer/plants/crop_search",
    enter: () => import("./farm_designer/plants/crop_catalog"),
    key: "CropCatalog"
  }),
  rc({
    $: "/designer/plants/crop_search/:crop",
    enter: () => import("./farm_designer/plants/crop_info"),
    key: "CropInfo"
  }),
  rc({
    $: "/designer/plants/crop_search/:crop/add",
    enter: () => import("./farm_designer/plants/add_plant"),
    key: "AddPlant"
  }),
  rc({
    $: "/designer/plants/move_to",
    enter: () => import("./farm_designer/plants/move_to"),
    key: "MoveTo"
  }),
  rc({
    $: "/designer/plants/saved_gardens",
    enter: () => import("./farm_designer/saved_gardens/saved_gardens"),
    key: "SavedGardens"
  }),
  rc({
    $: "/designer/plants/select",
    enter: () => import("./farm_designer/plants/select_plants"),
    key: "SelectPlants"
  }),
  rc({
    $: "/device",
    enter: () => import("./devices/devices"),
    key: "Devices"
  }),
  rc({
    $: "/farmware/*",
    enter: () => import("./farmware/index"),
    key: "FarmwarePage"
  }),
  rc({
    $: "/farmware",
    enter: () => import("./farmware/index"),
    key: "FarmwarePage"
  }),
  rc({
    $: "/logs",
    enter: () => import("./logs/index"),
    key: "Logs"
  }),
  rc({
    $: "/regimens",
    enter: () => import("./regimens/index"),
    key: "Regimens"
  }),
  rc({
    $: "/regimens/:regimen",
    enter: () => import("./regimens/index"),
    key: "Regimens"
  }),
  rc({
    $: "/sequences(/:sequence)",
    enter: () => import("./sequences/sequences"),
    key: "Sequences"
  }),
  rc({
    $: "/tools",
    enter: () => import("./tools/index"),
    key: "Tools"
  }),
  rc({
    $: "*",
    enter: () => import("./404"),
    key: "FourOhFour"
  }),
];
