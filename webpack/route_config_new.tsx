import * as React from "react";
import { RouteConfig } from "takeme";
import { Apology } from "./apology";

interface StandardRoute<T> {
  $: string;
  getModule: () => Promise<T>;
  key: keyof T;
}

interface SpecialRoute<T> {
  $: string;
  getChild: () => Promise<T>;
  key: keyof T;
}

function rt<T>(i: StandardRoute<T>) {
  return (callback: Function): RouteConfig => {
    const { $, getModule, key } = i;
    return {
      $,
      enter: async (info) => {
        try {
          callback((await getModule())[key], info);
        } catch (e) {
          console.error(e);
          callback(Apology, info);
        }
      }
    };
  };
}

function drt<T>(i: SpecialRoute<T>) {
  return (callback: Function): RouteConfig => {
    const { $, getChild, key } = i;
    return {
      $,
      enter: async (info) => { // ===========
        try {
          const El: any = (await getChild())[key];
          const { FarmDesigner } = await import("./farm_designer");
          const stub: any = {
            children: <El />,
            key: "FARM_DESIGNER_DYNAMIC_MAGIC"
          };
          callback(() => <FarmDesigner {...stub} />, info);
        } catch (e) {
          console.error(e);
          callback(Apology, info);
        }
      }
    };
  };
}

const FOUR_OH_FOUR = [rt({
  $: "*",
  getModule: () => import("./404"),
  key: "FourOhFour"
})];

const DESIGNER_ROUTES = [
  drt({
    $: "/designer",
    getChild: () => import("./farm_designer"),
    key: "FarmDesigner"
  }),
  drt({
    $: "/designer/plants",
    getChild: () => import("./farm_designer/plants/plant_inventory"),
    key: "Plants"
  }),
  drt({
    $: "/designer/farm_events",
    getChild: () => import("./farm_designer/farm_events/farm_events"),
    key: "FarmEvents"
  }),
  drt({
    $: "/designer/farm_events/:farm_event_id",
    getChild: () => import("./farm_designer/farm_events/edit_farm_event"),
    key: "EditFarmEvent"
  }),
  drt({
    $: "/designer/farm_events/add",
    getChild: () => import("./farm_designer/farm_events/add_farm_event"),
    key: "AddFarmEvent"
  }),
  drt({
    $: "/designer/plants/:plant_id",
    getChild: () => import("./farm_designer/plants/plant_info"),
    key: "PlantInfo"
  }),
  drt({
    $: "/designer/plants/:plant_id/edit",
    getChild: () => import("./farm_designer/plants/edit_plant_info"),
    key: "EditPlantInfo"
  }),
  drt({
    $: "/designer/plants/create_point",
    getChild: () => import("./farm_designer/plants/create_points"),
    key: "CreatePoints"
  }),
  drt({
    $: "/designer/plants/crop_search",
    getChild: () => import("./farm_designer/plants/crop_catalog"),
    key: "CropCatalog"
  }),
  drt({
    $: "/designer/plants/crop_search/:crop",
    getChild: () => import("./farm_designer/plants/crop_info"),
    key: "CropInfo"
  }),
  drt({
    $: "/designer/plants/crop_search/:crop/add",
    getChild: () => import("./farm_designer/plants/add_plant"),
    key: "AddPlant"
  }),
  drt({
    $: "/designer/plants/move_to",
    getChild: () => import("./farm_designer/plants/move_to"),
    key: "MoveTo"
  }),
  drt({
    $: "/designer/plants/saved_gardens",
    getChild: () => import("./farm_designer/saved_gardens/saved_gardens"),
    key: "SavedGardens"
  }),
  drt({
    $: "/designer/plants/select",
    getChild: () => import("./farm_designer/plants/select_plants"),
    key: "SelectPlants"
  })
];

/** Bind the route to a callback by calling in a function that passes the
  callback in as the first argument
 */
export const UNBOUND_ROUTES = [
  rt({
    $: "/account",
    getModule: () => import("./account"),
    key: "Account"
  }),
  rt({
    $: "/controls",
    getModule: () => import("./controls/controls"),
    key: "Controls"
  }),
  rt({
    $: "/device",
    getModule: () => import("./devices/devices"),
    key: "Devices"
  }),
  rt({
    $: "/farmware/*",
    getModule: () => import("./farmware"),
    key: "FarmwarePage"
  }),
  rt({
    $: "/farmware",
    getModule: () => import("./farmware"),
    key: "FarmwarePage"
  }),
  rt({
    $: "/logs",
    getModule: () => import("./logs"),
    key: "Logs"
  }),
  rt({
    $: "/regimens",
    getModule: () => import("./regimens"),
    key: "Regimens"
  }),
  rt({
    $: "/regimens/:regimen",
    getModule: () => import("./regimens"),
    key: "Regimens"
  }),
  rt({
    $: "/sequences(/:sequence)",
    getModule: () => import("./sequences/sequences"),
    key: "Sequences"
  }),
  rt({
    $: "/tools",
    getModule: () => import("./tools"),
    key: "Tools"
  }),
].concat(DESIGNER_ROUTES).concat(FOUR_OH_FOUR);
