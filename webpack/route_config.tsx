import * as React from "react";
import { RouteConfig } from "takeme";
import { Apology } from "./apology";

interface UnboundRouteConfig<T> {
  $: string;
  getModule: () => Promise<T>;
  key: keyof T;
}

interface LegacyRouteCfg<T> {
  $: string;
  getChild: () => Promise<T>;
  key: keyof T;
}

/** This is the preferred way to generate a route when there are no legacy
 *  concerns.
 *  PROBLEM:
 *   1. We want to lazy load each route's component to shrink the bundle size.
 *   2. We don't have access to `this.setState()` because `this` does not exist
 *      until runtime.
 *  SOLUTION:
 *   Write a helper function that creates a route in multiple steps.
 *   1. Pass in an object (StandardRoute<T>) that describes:
 *     * the URL
 *     * The module's file location (dynamic `import()` that returns the module
 *       as a promise)
 *     * The specific module that you want to use for the route
 *   2. Once that information is available, we can create an "unbound route".
 *      An unbound route is a function that has all needed URL / module
 *      information but does NOT yet have a callback to trigger when a route
 *      changes. Such a function is generated later (at runtime, in
 *      componentDidMount) and passed to the "unbound" route to create a "real"
 *      URL route that is needed by the `takeme` routing library.
 *      Workflow:
 *      DECLARE ROUTE DATA =>
 *        CREATE UNBOUND ROUTE =>
 *          BIND ROUTE CHANGE CALLBACK TO UNBOUND ROUTE =>
 *            DONE.
 */
function route<T>(i: UnboundRouteConfig<T>) {
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

/** The FarmDesigner was the only part of the application that used child
 * routes, a feature of our previous router package. Under the previous scheme,
 * a child route would be rendered inside of a shared <FarmDesigner/> component
 * to keep a consistent UI (the FarmDesigner side bar and floating menus, etc..)
 *
 * This was accomplished by passing the child route to <FarmDesigner/> via
 * this.props.children.
 *
 * This is not how the current router works. Rather than re-write numerous
 * FarmDesigner components to not use child routes, we instead have a
 * `legacyRoute` helper that emulates the child route feature.
 *
 * Don't use this for new FarmDesigner pages.
 * */
function legacyRoute<T>(i: LegacyRouteCfg<T>) {
  return (callback: Function): RouteConfig => {
    const { $, getChild, key } = i;
    return {
      $,
      enter: async (info) => { // ===========
        try {
          // tslint:disable-next-line:no-any
          const El: any = (await getChild())[key];
          // ^ Let route() / legacyRoute() catch type issues.

          // tslint:disable-next-line:no-any
          const stub: any = { children: <El /> };
          // ^ react-redux will mutate the real props behind the scenes.
          const { FarmDesigner } = await import("./farm_designer");
          callback(() => <FarmDesigner {...stub} />, info);
        } catch (e) {
          console.error(e);
          callback(Apology, info);
        }
      }
    };
  };
}

/** The 404 handler. All unresolved routes end up here. MUST BE LAST ITEM IN
 * ROUTE CONFIG!!! */
const NOT_FOUND = route({
  $: "*",
  getModule: () => import("./404"),
  key: "FourOhFour"
});

/** Bind the route to a callback by calling in a function that passes the
  callback in as the first argument
 */
export const UNBOUND_ROUTES = [
  route({
    $: "/account",
    getModule: () => import("./account"),
    key: "Account"
  }),
  route({
    $: "/controls",
    getModule: () => import("./controls/controls"),
    key: "Controls"
  }),
  route({
    $: "/device",
    getModule: () => import("./devices/devices"),
    key: "Devices"
  }),
  route({
    $: "/farmware/*",
    getModule: () => import("./farmware"),
    key: "FarmwarePage"
  }),
  route({
    $: "/farmware",
    getModule: () => import("./farmware"),
    key: "FarmwarePage"
  }),
  route({
    $: "/logs",
    getModule: () => import("./logs"),
    key: "Logs"
  }),
  route({
    $: "/regimens",
    getModule: () => import("./regimens"),
    key: "Regimens"
  }),
  route({
    $: "/regimens/:regimen",
    getModule: () => import("./regimens"),
    key: "Regimens"
  }),
  route({
    $: "/sequences(/:sequence)",
    getModule: () => import("./sequences/sequences"),
    key: "Sequences"
  }),
  route({
    $: "/tools",
    getModule: () => import("./tools"),
    key: "Tools"
  }),
  legacyRoute({
    $: "/designer",
    getChild: () => import("./farm_designer"),
    key: "FarmDesigner"
  }),
  legacyRoute({
    $: "/designer/plants",
    getChild: () => import("./farm_designer/plants/plant_inventory"),
    key: "Plants"
  }),
  legacyRoute({
    $: "/designer/farm_events",
    getChild: () => import("./farm_designer/farm_events/farm_events"),
    key: "FarmEvents"
  }),
  legacyRoute({
    $: "/designer/farm_events/:farm_event_id",
    getChild: () => import("./farm_designer/farm_events/edit_farm_event"),
    key: "EditFarmEvent"
  }),
  legacyRoute({
    $: "/designer/farm_events/add",
    getChild: () => import("./farm_designer/farm_events/add_farm_event"),
    key: "AddFarmEvent"
  }),
  legacyRoute({
    $: "/designer/plants/:plant_id",
    getChild: () => import("./farm_designer/plants/plant_info"),
    key: "PlantInfo"
  }),
  legacyRoute({
    $: "/designer/plants/:plant_id/edit",
    getChild: () => import("./farm_designer/plants/edit_plant_info"),
    key: "EditPlantInfo"
  }),
  legacyRoute({
    $: "/designer/plants/create_point",
    getChild: () => import("./farm_designer/plants/create_points"),
    key: "CreatePoints"
  }),
  legacyRoute({
    $: "/designer/plants/crop_search",
    getChild: () => import("./farm_designer/plants/crop_catalog"),
    key: "CropCatalog"
  }),
  legacyRoute({
    $: "/designer/plants/crop_search/:crop",
    getChild: () => import("./farm_designer/plants/crop_info"),
    key: "CropInfo"
  }),
  legacyRoute({
    $: "/designer/plants/crop_search/:crop/add",
    getChild: () => import("./farm_designer/plants/add_plant"),
    key: "AddPlant"
  }),
  legacyRoute({
    $: "/designer/plants/move_to",
    getChild: () => import("./farm_designer/plants/move_to"),
    key: "MoveTo"
  }),
  legacyRoute({
    $: "/designer/plants/saved_gardens",
    getChild: () => import("./farm_designer/saved_gardens/saved_gardens"),
    key: "SavedGardens"
  }),
  legacyRoute({
    $: "/designer/plants/select",
    getChild: () => import("./farm_designer/plants/select_plants"),
    key: "SelectPlants"
  }),
].concat([NOT_FOUND]);
