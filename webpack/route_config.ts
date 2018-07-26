import { App } from "./app";
import { crashPage } from "./crash_page";
import { RouterState, RedirectFunction, PlainRoute } from "react-router";

/** These methods are a way to determine how to load certain modules
 * based on the device (mobile or desktop) for optimization/css purposes.
 */
export function maybeReplaceDesignerModules(next: RouterState,
  replace: RedirectFunction) {
  if (next.location.pathname === "/app/designer") {
    replace(`${next.location.pathname}/plants`);
  }
}

/** Create a react router config for a specific route. */
function page<T>(path: string,
  getter: () => Promise<T>,
  key: keyof T): PlainRoute {

  return {
    path,
    getComponent(_, cb): void {
      const ok = (mod: T) => cb(undefined, mod[key] as any);
      const no = (e: object) => cb(undefined, crashPage(e));
      /** Whatever you do, make sure this function stays void or you will get a
       * bunch of silent errors. - RC*/
      getter().then(ok, no);
    }
  };
}

const controlsRoute: PlainRoute =
  page("app/controls",
    () => import("./controls/controls"), "Controls");

export const designerRoutes: PlainRoute = {
  path: "app/designer",
  getComponent(_, cb) {
    import("./farm_designer/index")
      .then(module => cb(undefined, module.FarmDesigner))
      .catch((e: object) => cb(undefined, crashPage(e)));
  },
  childRoutes: [
    page("plants",
      () => import("./farm_designer/plants/plant_inventory"),
      "Plants"),
    page("plants/crop_search",
      () => import("./farm_designer/plants/crop_catalog"),
      "CropCatalog"),
    page("plants/crop_search/:crop",
      () => import("./farm_designer/plants/crop_info"),
      "CropInfo"),
    page("plants/crop_search/:crop/add",
      () => import("./farm_designer/plants/add_plant"),
      "AddPlant"),
    page("plants/select",
      () => import("./farm_designer/plants/select_plants"),
      "SelectPlants"),
    page("plants/move_to",
      () => import("./farm_designer/plants/move_to"),
      "MoveTo"),
    page("plants/create_point",
      () => import("./farm_designer/plants/create_points"),
      "CreatePoints"),
    page("plants/:plant_id",
      () => import("./farm_designer/plants/plant_info"),
      "PlantInfo"),
    page("plants/:plant_id/edit",
      () => import("./farm_designer/plants/edit_plant_info"),
      "EditPlantInfo"),
    page("farm_events",
      () => import("./farm_designer/farm_events/farm_events"),
      "FarmEvents"),
    page("farm_events/add",
      () => import("./farm_designer/farm_events/add_farm_event"),
      "AddFarmEvent"),
    page("farm_events/:farm_event_id",
      () => import("./farm_designer/farm_events/edit_farm_event"),
      "EditFarmEvent"),
  ]
};

export const topLevelRoutes: PlainRoute = {
  component: App,
  indexRoute: controlsRoute,
  childRoutes: [
    page("app/account",
      () => import("./account/index"),
      "Account"),
    controlsRoute,
    page("app/device",
      () => import("./devices/devices"),
      "Devices"),
    page("app/farmware",
      () => import("./farmware/index"),
      "FarmwarePage"),
    page("app/farmware/:farmware",
      () => import("./farmware/index"),
      "FarmwarePage"),
    designerRoutes,
    page("app/regimens",
      () => import("./regimens/index"),
      "Regimens"),
    page("app/regimens/:regimen",
      () => import("./regimens/index"),
      "Regimens"),
    page("app/sequences",
      () => import("./sequences/sequences"),
      "Sequences"),
    page("app/sequences/:sequence",
      () => import("./sequences/sequences"),
      "Sequences"),
    page("app/tools",
      () => import("./tools/index"),
      "Tools"),
    page("app/logs",
      () => import("./logs/index"),
      "Logs"),
    page("*",
      () => import("./404"),
      "FourOhFour"),
  ]
};
