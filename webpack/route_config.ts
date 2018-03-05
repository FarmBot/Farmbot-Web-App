import { App } from "./app";
import { crashPage } from "./crash_page";
import { RouterState, RedirectFunction } from "react-router";

/** These methods are a way to determine how to load certain modules
 * based on the device (mobile or desktop) for optimization/css purposes.
 */
export function maybeReplaceDesignerModules(next: RouterState,
  replace: RedirectFunction) {
  if (next.location.pathname === "/app/designer") {
    replace(`${next.location.pathname}/plants`);
  }
}

function page(path: string, getter: () => Promise<React.ReactType>) {
  return {
    path,
    getComponent(_: void, cb: Function) {
      const ok = (component: React.ReactType) => cb(undefined, component);
      const no = (e: object) => cb(undefined, crashPage(e));
      return getter().then(ok, no);
    }
  };
}
const controlsRoute =
  page("app/controls", async () => (await import("./controls/controls")).Controls);

export const designerRoutes = {
  path: "app/designer",
  onEnter: maybeReplaceDesignerModules,
  getComponent(_discard: void, cb: Function) {
    import("./farm_designer/index")
      .then(module => cb(undefined, module.FarmDesigner))
      .catch((e: object) => cb(undefined, crashPage(e)));
  },
  childRoutes: [
    page("plants",
      async () => (await import("./farm_designer/plants/plant_inventory")).Plants),
    page("plants/crop_search",
      async () => (await import("./farm_designer/plants/crop_catalog")).CropCatalog),
    page("plants/crop_search/:crop",
      async () => (await import("./farm_designer/plants/crop_info")).CropInfo),
    page("plants/crop_search/:crop/add",
      async () => (await import("./farm_designer/plants/add_plant")).AddPlant),
    page("plants/select",
      async () => (await import("./farm_designer/plants/select_plants")).SelectPlants),
    page("plants/move_to", async () => (await import("./farm_designer/plants/move_to")).MoveTo),
    page("plants/create_point",
      async () => (await import("./farm_designer/plants/create_points")).CreatePoints),
    page("plants/:plant_id",
      async () => (await import("./farm_designer/plants/plant_info")).PlantInfo),
    page("plants/:plant_id/edit",
      async () => (await import("./farm_designer/plants/edit_plant_info")).EditPlantInfo),
    page("farm_events",
      async () => (await import("./farm_designer/farm_events/farm_events")).FarmEvents),
    page("farm_events/add",
      async () => (await import("./farm_designer/farm_events/add_farm_event")).AddFarmEvent),
    page("farm_events/:farm_event_id",
      async () => (await import("./farm_designer/farm_events/edit_farm_event")).EditFarmEvent),
  ]
};

export const topLevelRoutes = {
  component: App,
  indexRoute: controlsRoute,
  childRoutes: [
    page("app/account", async () => (await import("./account/index")).Account),
    controlsRoute,
    page("app/device", async () => (await import("./devices/devices")).Devices),
    page("app/farmware", async () => (await import("./farmware/index")).FarmwarePage),
    page("app/regimens", async () => (await import("./regimens/index")).Regimens),
    page("app/regimens/:regimen", async () => (await import("./regimens/index")).Regimens),
    page("app/sequences", async () => (await import("./sequences/sequences")).Sequences),
    page("app/sequences/:sequence", async () => (await import("./sequences/sequences")).Sequences),
    page("app/tools", async () => (await import("./tools/index")).Tools),
    page("app/logs", async () => (await import("./logs/index")).Logs),
    page("*", async () => (await import("./404")).FourOhFour),
    designerRoutes,
  ]
};
