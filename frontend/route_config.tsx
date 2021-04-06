import { RouteConfig } from "takeme";
import { Apology } from "./apology";
import { AnyConnectedComponent, ChangeRoute } from "./routes";

/** 99% of route configurations will use this interface. */
interface UnboundRouteConfigNoChild<T> {
  children: false,
  $: string;
  getModule: () => Promise<T>;
  key: keyof T;
}

/** A few routes (in the FarmDesigner, mainly) need to use child routes.
 * If that's the case, set `children: true` and pass in a `getChild`/`childKey`
 * property.
 */
interface UnboundRouteConfigChild<T, U> {
  children: true,
  $: string;
  getModule: () => Promise<T>;
  key: keyof T;
  getChild: () => Promise<U>;
  childKey: keyof U;
}

/** The union of both route config types. */
export type UnboundRouteConfig<T, U> =
  UnboundRouteConfigNoChild<T> | UnboundRouteConfigChild<T, U>;

/** This is the preferred way to generate a route in the app.
 *  PROBLEM:
 *   1. We want to lazy load each route's component to shrink the bundle size.
 *   2. We don't have access to `this.setState()` until runtime because `this`
 *      is a mounted component.
 *  SOLUTION:
 *   Write a helper function that creates a route in multiple steps.
 *   1. Pass in an object (UnboundRouteConfig<T, U>) that describes:
 *     * the URL
 *     * The module's file location (dynamic `import()` that returns the module
 *       as a promise)
 *     * The specific module that you want to use for the route.
 *     * (optional) a set of child routes (like the FarmDesigner side panel)
 *   2. Once that information is available, we can create an "unbound route".
 *      An unbound route is a function that has all needed URL / module
 *      information but does NOT yet have a callback to trigger when a route
 *      changes. Such a function is generated later (at runtime, in
 *      componentDidMount) and passed to the "unbound" route to create a "real"
 *      URL route that is needed by the `takeme` routing library.
 *      Workflow:
 *
 *      Determine how to load the route and children =>
 *        Pass that information to route() =>
 *          Pass the resulting UnboundRoute to `takeme` router. =>
 *            DONE.
 */
function route<T, U>(info: UnboundRouteConfig<T, U>) {
  return (changeRoute: ChangeRoute): RouteConfig => {
    const { $ } = info;
    return {
      $,
      enter: async () => {
        try {
          const comp = (await info.getModule())[info.key];
          if (info.children) {
            const child = (await info.getChild())[info.childKey];
            changeRoute(comp as unknown as AnyConnectedComponent,
              info,
              child as unknown as AnyConnectedComponent);
          } else {
            changeRoute(comp as unknown as AnyConnectedComponent, info);
          }
        } catch (e) {
          console.error(e);
          changeRoute(Apology, info);
        }
      }
    };
  };
}

/** The 404 handler. All unresolved routes end up here. MUST BE LAST ITEM IN
 * ROUTE CONFIG!!! */
export const NOT_FOUND_ROUTE = route({
  children: false,
  $: "*",
  getModule: () => import("./404"),
  key: "FourOhFour"
});

const getModule = () => import("./farm_designer");
const key = "FarmDesigner";

/** Bind the route to a callback by calling in a function that passes the
  callback in as the first argument.
 *
 * DO NOT RE-ORDER ITEMS FOR READABILITY--they are order-dependent.
 * Stuff will break if the route order is changed.
 * (e.g., must be ["a", "a/b", "a/b/:c/d", "a/b/:c", "a/:e"],
 *        404 must be last, etc.)
 */
export const UNBOUND_ROUTES = [
  route({
    children: false,
    $: "/controls",
    getModule: () => import("./controls/controls_page"),
    key: "Controls",
  }),
  route({
    children: false,
    $: "/messages",
    getModule: () => import("./messages/messages_page"),
    key: "Messages",
  }),
  route({
    children: false,
    $: "/logs",
    getModule: () => import("./logs"),
    key: "Logs",
  }),
  route({
    children: false,
    $: "/sequences(/:sequence)",
    getModule: () => import("./sequences/sequences"),
    key: "Sequences",
  }),
  route({
    children: false,
    $: "/designer",
    getModule: () => import("./farm_designer"),
    key: "FarmDesigner"
  }),
  route({
    children: true,
    $: "/designer/events",
    getModule,
    key,
    getChild: () => import("./farm_events/farm_events"),
    childKey: "FarmEvents"
  }),
  route({
    children: true,
    $: "/designer/events/add",
    getModule,
    key,
    getChild: () => import("./farm_events/add_farm_event"),
    childKey: "AddFarmEvent"
  }),
  route({
    children: true,
    $: "/designer/events/:farm_event_id",
    getModule,
    key,
    getChild: () => import("./farm_events/edit_farm_event"),
    childKey: "EditFarmEvent"
  }),
  route({
    children: true,
    $: "/designer/plants",
    getModule,
    key,
    getChild: () => import("./plants/plant_inventory"),
    childKey: "Plants"
  }),
  route({
    children: true,
    $: "/designer/move_to",
    getModule,
    key,
    getChild: () => import("./farm_designer/move_to"),
    childKey: "MoveTo"
  }),
  route({
    children: true,
    $: "/designer/location_info",
    getModule,
    key,
    getChild: () => import("./farm_designer/location_info"),
    childKey: "LocationInfo"
  }),
  route({
    children: true,
    $: "/designer/plants/gardens",
    getModule,
    key,
    getChild: () => import("./saved_gardens/saved_gardens"),
    childKey: "SavedGardens"
  }),
  route({
    children: true,
    $: "/designer/plants/select",
    getModule,
    key,
    getChild: () => import("./plants/select_plants"),
    childKey: "SelectPlants"
  }),
  route({
    children: true,
    $: "/designer/points",
    getModule,
    key,
    getChild: () => import("./points/point_inventory"),
    childKey: "Points"
  }),
  route({
    children: true,
    $: "/designer/points/add",
    getModule,
    key,
    getChild: () => import("./points/create_points"),
    childKey: "CreatePoints"
  }),
  route({
    children: true,
    $: "/designer/points/:point_id",
    getModule,
    key,
    getChild: () => import("./points/point_info"),
    childKey: "EditPoint"
  }),
  route({
    children: true,
    $: "/designer/plants/crop_search",
    getModule,
    key,
    getChild: () => import("./plants/crop_catalog"),
    childKey: "CropCatalog"
  }),
  route({
    children: true,
    $: "/designer/plants/crop_search/:crop/add",
    getModule,
    key,
    getChild: () => import("./plants/add_plant"),
    childKey: "AddPlant"
  }),
  route({
    children: true,
    $: "/designer/plants/crop_search/:crop",
    getModule,
    key,
    getChild: () => import("./plants/crop_info"),
    childKey: "CropInfo"
  }),
  route({
    children: true,
    $: "/designer/plants/:plant_id",
    getModule,
    key,
    getChild: () => import("./plants/plant_info"),
    childKey: "PlantInfo"
  }),
  route({
    children: true,
    $: "/designer/gardens",
    getModule,
    key,
    getChild: () => import("./saved_gardens/saved_gardens"),
    childKey: "SavedGardens"
  }),
  route({
    children: true,
    $: "/designer/gardens/templates",
    getModule,
    key,
    getChild: () => import("./plants/plant_inventory"),
    childKey: "Plants"
  }),
  route({
    children: true,
    $: "/designer/gardens/templates/:plant_template_id",
    getModule,
    key,
    getChild: () => import("./plants/plant_info"),
    childKey: "PlantInfo"
  }),
  route({
    children: true,
    $: "/designer/gardens/add",
    getModule,
    key,
    getChild: () => import("./saved_gardens/garden_add"),
    childKey: "AddGarden"
  }),
  route({
    children: true,
    $: "/designer/gardens/:saved_garden_id",
    getModule,
    key,
    getChild: () => import("./saved_gardens/garden_edit"),
    childKey: "EditGarden"
  }),
  route({
    children: true,
    $: "/designer/controls",
    getModule,
    key,
    getChild: () => import("./controls/controls"),
    childKey: "DesignerControls"
  }),
  route({
    children: true,
    $: "/designer/setup",
    getModule,
    key,
    getChild: () => import("./wizard/index"),
    childKey: "SetupWizard"
  }),
  route({
    children: true,
    $: "/designer/sensors",
    getModule,
    key,
    getChild: () => import("./sensors/sensors"),
    childKey: "DesignerSensors"
  }),
  route({
    children: true,
    $: "/designer/photos",
    getModule,
    key,
    getChild: () => import("./photos/photos"),
    childKey: "DesignerPhotos"
  }),
  route({
    children: true,
    $: "/designer/farmware",
    getModule,
    key,
    getChild: () => import("./farmware/panel/list"),
    childKey: "DesignerFarmwareList"
  }),
  route({
    children: true,
    $: "/designer/farmware/add",
    getModule,
    key,
    getChild: () => import("./farmware/panel/add"),
    childKey: "DesignerFarmwareAdd"
  }),
  route({
    children: true,
    $: "/designer/farmware/:farmware_name",
    getModule,
    key,
    getChild: () => import("./farmware/panel/info"),
    childKey: "DesignerFarmwareInfo"
  }),
  route({
    children: true,
    $: "/designer/sequences",
    getModule,
    key,
    getChild: () => import("./sequences/panel/list"),
    childKey: "DesignerSequenceList"
  }),
  route({
    children: true,
    $: "/designer/sequences/commands",
    getModule,
    key,
    getChild: () => import("./sequences/panel/commands"),
    childKey: "DesignerSequenceCommands"
  }),
  route({
    children: true,
    $: "/designer/sequences/:sequence_name",
    getModule,
    key,
    getChild: () => import("./sequences/panel/editor"),
    childKey: "DesignerSequenceEditor"
  }),
  route({
    children: true,
    $: "/designer/regimens",
    getModule,
    key,
    getChild: () => import("./regimens/list/list"),
    childKey: "DesignerRegimenList"
  }),
  route({
    children: true,
    $: "/designer/regimens/scheduler",
    getModule,
    key,
    getChild: () => import("./regimens/bulk_scheduler/scheduler"),
    childKey: "DesignerRegimenScheduler"
  }),
  route({
    children: true,
    $: "/designer/regimens/:regimen_name",
    getModule,
    key,
    getChild: () => import("./regimens/editor/editor"),
    childKey: "DesignerRegimenEditor"
  }),
  route({
    children: true,
    $: "/designer/messages",
    getModule,
    key,
    getChild: () => import("./messages/messages"),
    childKey: "MessagesPanel"
  }),
  route({
    children: true,
    $: "/designer/help",
    getModule,
    key,
    getChild: () => import("./help/documentation"),
    childKey: "SoftwareDocsPanel"
  }),
  route({
    children: true,
    $: "/designer/developer",
    getModule,
    key,
    getChild: () => import("./help/documentation"),
    childKey: "DeveloperDocsPanel"
  }),
  route({
    children: true,
    $: "/designer/genesis",
    getModule,
    key,
    getChild: () => import("./help/documentation"),
    childKey: "GenesisDocsPanel"
  }),
  route({
    children: true,
    $: "/designer/express",
    getModule,
    key,
    getChild: () => import("./help/documentation"),
    childKey: "ExpressDocsPanel"
  }),
  route({
    children: true,
    $: "/designer/business",
    getModule,
    key,
    getChild: () => import("./help/documentation"),
    childKey: "MetaDocsPanel"
  }),
  route({
    children: true,
    $: "/designer/education",
    getModule,
    key,
    getChild: () => import("./help/documentation"),
    childKey: "EducationDocsPanel"
  }),
  route({
    children: true,
    $: "/designer/tours",
    getModule,
    key,
    getChild: () => import("./help/tours_panel"),
    childKey: "ToursPanel"
  }),
  route({
    children: true,
    $: "/designer/support",
    getModule,
    key,
    getChild: () => import("./help/support"),
    childKey: "SupportPanel"
  }),
  route({
    children: true,
    $: "/designer/jobs",
    getModule,
    key,
    getChild: () => import("./devices/jobs"),
    childKey: "JobsPanel"
  }),
  route({
    children: true,
    $: "/designer/settings",
    getModule,
    key,
    getChild: () => import("./settings"),
    childKey: "DesignerSettings"
  }),
  route({
    children: true,
    $: "/designer/tools",
    getModule,
    key,
    getChild: () => import("./tools"),
    childKey: "Tools"
  }),
  route({
    children: true,
    $: "/designer/tools/add",
    getModule,
    key,
    getChild: () => import("./tools/add_tool"),
    childKey: "AddTool"
  }),
  route({
    children: true,
    $: "/designer/tools/:tool_id",
    getModule,
    key,
    getChild: () => import("./tools/edit_tool"),
    childKey: "EditTool"
  }),
  route({
    children: true,
    $: "/designer/tool-slots/add",
    getModule,
    key,
    getChild: () => import("./tools/add_tool_slot"),
    childKey: "AddToolSlot"
  }),
  route({
    children: true,
    $: "/designer/tool-slots/:tool_id",
    getModule,
    key,
    getChild: () => import("./tools/edit_tool_slot"),
    childKey: "EditToolSlot"
  }),
  route({
    children: true,
    $: "/designer/groups",
    getModule,
    key,
    getChild: () => import("./point_groups/group_list_panel"),
    childKey: "GroupListPanel"
  }),
  route({
    children: true,
    $: "/designer/groups/:group_id",
    getModule,
    key,
    getChild: () => import("./point_groups/group_detail"),
    childKey: "GroupDetail"
  }),
  route({
    children: true,
    $: "/designer/weeds",
    getModule,
    key,
    getChild: () => import("./weeds/weeds_inventory"),
    childKey: "Weeds"
  }),
  route({
    children: true,
    $: "/designer/weeds/add",
    getModule,
    key,
    getChild: () => import("./points/create_points"),
    childKey: "CreatePoints"
  }),
  route({
    children: true,
    $: "/designer/weeds/:point_id",
    getModule,
    key,
    getChild: () => import("./weeds/weeds_edit"),
    childKey: "EditWeed"
  }),
  route({
    children: true,
    $: "/designer/zones",
    getModule,
    key,
    getChild: () => import("./zones/zones_inventory"),
    childKey: "Zones"
  }),
  route({
    children: true,
    $: "/designer/zones/add",
    getModule,
    key,
    getChild: () => import("./zones/add_zone"),
    childKey: "AddZone"
  }),
  route({
    children: true,
    $: "/designer/zones/:zone_id",
    getModule,
    key,
    getChild: () => import("./zones/edit_zone"),
    childKey: "EditZone"
  }),
].concat([NOT_FOUND_ROUTE]);
