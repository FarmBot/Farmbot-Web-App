import "./css/_index.scss";
import * as React from "react";
import { Provider } from "react-redux";
import { Router, RedirectFunction, RouterState } from "react-router";
import App from "./app";
import { store } from "./redux/store";
import { history } from "./history";
import { Store } from "./redux/interfaces";
import { ready } from "./config/actions";
import { Session } from "./session";
import { isMobile } from "./util";
import { hardRefresh } from "./util";
import * as _ from "lodash";

hardRefresh();

interface RootComponentProps {
  store: Store;
}

let errorLoading = (cb: Function) => function handleError(err: object) {
  console.error("Dynamic page loading failed", err);
  var container = document.getElementById("root");
  let stack = _.get(err, "stack", "No stack.");
  if (container) {
    let message = _.get(err, "message", "No message available.");
    _.get(window, "Rollbar.error", (x: string) => { })(message);
    container.innerHTML = (`
    <div>
      <h1> Something went wrong! </h1>
      <p>We hit an internal error while rendering this page.</p>
      <p>We have been notified of the issue and will investigate a solution shortly.</p>
      <hr/>
      <p>In the mean time, you can try the following:</P>
      <ul>
        <li> Refresh the page and log in again.</li>
        <li> Send the error information (below) to our developer team via the
        <a href="http://forum.farmbot.org/c/software">FarmBot software
        forum</a>. Including additional information (such as steps leading up
        to the error) help us identify solutions more quickly. </li>
      <hr/>
      <pre>
      <br/>
      ${JSON.stringify({
        message,
        stack: stack.split("\n").join("<br/>")
      }, null, "  ")}
    </pre>
    </div>
  `);
  }
  sessionStorage.clear();
  if (!location.hostname.includes("localhost")) {
    // Clear cache for end users, but not developers.
    localStorage.clear();
  }
  let y = document.querySelectorAll("link");
  for (var x = 0; x < y.length; x++) {
    var element = y[x];
    element.remove();
  }
};
let controlsRoute = {
  path: "app/controls",
  getComponent(_: void, cb: Function) {
    import("./controls/controls").then(
      (module) => cb(null, module.Controls)
    ).catch(errorLoading(cb));
  }
};
export class RootComponent extends React.Component<RootComponentProps, {}> {

  requireAuth(_: RouterState, replace: RedirectFunction) {
    let { store } = this.props;
    if (Session.get()) { // has a previous session in cache
      if (store.getState().auth) { // Has session, logged in.
        return;
      } else { // Has session but not logged in (returning visitor).
        store.dispatch(ready());
      }
    } else { // Not logged in yet.
      Session.clear(true);
    }
  }

  /** These methods are a way to determine how to load certain modules
   * based on the device (mobile or desktop) for optimization/css purposes.
   * Open to revision.
   */
  maybeReplaceDesignerModules(next: RouterState, replace: RedirectFunction) {
    if (next.location.pathname === "/app/designer" && !isMobile()) {
      replace(`${next.location.pathname}/plants`);
    }
  }

  // replaceSequencesModules(next: RouterState, replace: RedirectFunction) {
  //   if (next.location.pathname === "/app/sequences" && isMobile()) {
  //     replace(`${next.location.pathname}/`);
  //   }
  // };

  /*
    /app                => App
    /app/account        => Account
    /app/controls       => Controls
    /app/device         => Devices
    /app/designer?p1&p2 => FarmDesigner
    /app/regimens       => Regimens
    /app/sequences      => Sequences
    /app/tools          => Tools
    /app/404            => 404
  */

  routes = {
    component: App,
    indexRoute: controlsRoute,
    childRoutes: [
      {
        path: "app/account",
        getComponent(_: void, cb: Function) {
          import("./account/index").then(
            (module) => cb(null, module.Account)
          ).catch(errorLoading(cb));
        }
      },
      controlsRoute,
      {
        path: "app/device",
        getComponent(_: void, cb: Function) {
          import("./devices/devices").then(
            (module) => cb(null, module.Devices)
          ).catch(errorLoading(cb));
        }
      },
      {
        path: "app/farmware",
        getComponent(_: void, cb: Function) {
          import("./farmware/index").then(
            (module) => cb(null, module.FarmwarePage)
          ).catch(errorLoading(cb));
        }
      },
      {
        path: "app/designer",
        onEnter: this.maybeReplaceDesignerModules.bind(this),
        getComponent(_: void, cb: Function) {
          import("./farm_designer/index").then(
            (module) => cb(null, module.FarmDesigner)
          ).catch(errorLoading(cb));
        },
        childRoutes: [
          {
            path: "plants",
            getComponent(_: void, cb: Function) {
              import("./farm_designer/plants/plant_inventory").then(
                (module) => cb(null, module.Plants)
              ).catch(errorLoading(cb));
            },
          },
          {
            path: "plants/crop_search",
            getComponent(_: void, cb: Function) {
              import("./farm_designer/plants/crop_catalog").then(
                (module) => cb(null, module.CropCatalog)
              ).catch(errorLoading(cb));
            },
          },
          {
            path: "plants/crop_search/:crop",
            getComponent(_: void, cb: Function) {
              import("./farm_designer/plants/crop_info").then(
                (module) => cb(null, module.CropInfo)
              ).catch(errorLoading(cb));
            },
          },
          {
            path: "plants/crop_search/:crop/add",
            getComponent(_: void, cb: Function) {
              import("./farm_designer/plants/dnd_crop_mobile").then(
                (module) => cb(null, module.DNDCropMobile)
              ).catch(errorLoading(cb));
            },
          },
          {
            path: "plants/:plant_id",
            getComponent(_: void, cb: Function) {
              import("./farm_designer/plants/plant_info").then(
                (module) => cb(null, module.PlantInfo)
              ).catch(errorLoading(cb));
            },
          },
          {
            path: "plants/:plant_id/edit",
            getComponent(_: void, cb: Function) {
              import("./farm_designer/plants/edit_plant_info").then(
                (module) => cb(null, module.EditPlantInfo)
              ).catch(errorLoading(cb));
            },
          },
          {
            path: "farm_events",
            getComponent(_: void, cb: Function) {
              import("./farm_designer/farm_events/farm_events").then(
                (module) => cb(null, module.FarmEvents)
              ).catch(errorLoading(cb));
            }
          },
          {
            path: "farm_events/add",
            getComponent(_: void, cb: Function) {
              import("./farm_designer/farm_events/add_farm_event").then(
                (module) => cb(null, module.AddFarmEvent)
              ).catch(errorLoading(cb));
            }
          },
          {
            path: "farm_events/:farm_event_id",
            getComponent(_: void, cb: Function) {
              import("./farm_designer/farm_events/edit_farm_event").then(
                (module) => cb(null, module.EditFarmEvent)
              ).catch(errorLoading(cb));
            }
          }
        ]
      },
      {
        path: "app/regimens",
        getComponent(_: void, cb: Function) {
          if (!isMobile()) {
            import("./regimens/index").then(
              (module) => cb(null, module.Regimens)
            ).catch(errorLoading(cb));
          } else {
            import("./regimens/list/index").then(
              (module) => cb(null, module.RegimensList)
            ).catch(errorLoading(cb));
          }
        },
      },
      {
        path: "app/regimens/:regimen",
        getComponent(_: void, cb: Function) {
          import("./regimens/index").then(
            (module) => cb(null, module.Regimens)
          ).catch(errorLoading(cb));
        }
      },
      {
        path: "app/sequences",
        getComponent(_: void, cb: Function) {
          import("./sequences/sequences").then(
            (module) => cb(null, module.Sequences)
          ).catch(errorLoading(cb));
        },
      },
      {
        path: "app/sequences/:sequence",
        getComponent(_: void, cb: Function) {
          import("./sequences/sequences").then(
            (module) => cb(null, module.Sequences)
          ).catch(errorLoading(cb));
        },
      },
      {
        path: "app/tools",
        getComponent(_: void, cb: Function) {
          import("./tools/index").then(
            (module) => cb(null, module.Tools)
          ).catch(errorLoading(cb));
        }
      },
      {
        path: "*",
        getComponent(_: void, cb: Function) {
          import("./404").then(
            (module) => cb(null, module.FourOhFour)
          ).catch(errorLoading(cb));
        }
      }
    ]
  };

  render() {
    // TODO: Why is this happening? Started after TSC 2.4 upgrade.
    //       Let's re-investigate after our deps are upgraded.
    //       - RC 30 Jun 17
    return <Provider store={store}>
      <Router history={history}>
        {this.routes}
      </Router>
    </Provider>;
  }
}
