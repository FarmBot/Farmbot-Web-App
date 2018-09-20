import { RouteConfig } from "takeme";
import { Apology } from "./apology";

interface UnboundRouteConfig<T> {
  $: string;
  getModule: () => Promise<T>;
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

/** The 404 handler. All unresolved routes end up here. MUST BE LAST ITEM IN
 * ROUTE CONFIG!!! */
export const NOT_FOUND_ROUTE = route({
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
    $: "/farmware(/:name)",
    getModule: () => import("./farmware"),
    key: "FarmwarePage"
  }),
  route({
    $: "/logs",
    getModule: () => import("./logs"),
    key: "Logs"
  }),
  route({
    $: "/regimens(/:regimen)",
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
];
