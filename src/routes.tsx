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
hardRefresh()
interface RootComponentProps {
  store: Store;
}
declare const System: any;
let errorLoading = (cb: any) => function handleError(err: any) {
  console.error("Dynamic page loading failed", err);
  var container = document.getElementById("root");
  let stack = _.get(err, "stack", "No stack.")
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
}
let controlsRoute = {
  path: "app/controls",
  getComponent(location: any, cb: any) {
    System.import("./controls/controls.tsx").then(
      (module: any) => cb(null, module.Controls)
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
      };
    } else { // Not logged in yet.
      Session.clear(true);
    }
  };

  /** These methods are a way to determine how to load certain modules
   * based on the device (mobile or desktop) for optimization/css purposes.
   * Open to revision.
   */
  maybeReplaceDesignerModules(next: RouterState, replace: RedirectFunction) {
    if (next.location.pathname === "/app/designer" && !isMobile()) {
      replace(`${next.location.pathname}/plants`);
    }
  };

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
        getComponent(location: any, cb: any) {
          System.import("./account/index.tsx").then(
            (module: any) => cb(null, module.Account)
          ).catch(errorLoading(cb));
        }
      },
      controlsRoute,
      {
        path: "app/device",
        getComponent(location: any, cb: any) {
          System.import("./devices/devices.tsx").then(
            (module: any) => cb(null, module.Devices)
          ).catch(errorLoading(cb));
        }
      },
      {
        path: "app/farmware",
        getComponent(location: any, cb: any) {
          System.import("./farmware/index.tsx").then(
            (module: any) => cb(null, module.FarmwarePage)
          ).catch(errorLoading(cb));
        }
      },
      {
        path: "app/designer",
        onEnter: this.maybeReplaceDesignerModules.bind(this),
        getComponent(location: any, cb: any) {
          System.import("./farm_designer/index.tsx").then(
            (module: any) => cb(null, module.FarmDesigner)
          ).catch(errorLoading(cb));
        },
        childRoutes: [
          {
            path: "plants",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/plants/plant_inventory.tsx").then(
                (module: any) => cb(null, module.Plants)
              ).catch(errorLoading(cb));
            },
          },
          {
            path: "plants/crop_search",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/plants/crop_catalog.tsx").then(
                (module: any) => cb(null, module.CropCatalog)
              ).catch(errorLoading(cb));
            },
          },
          {
            path: "plants/crop_search/:crop",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/plants/crop_info.tsx").then(
                (module: any) => cb(null, module.CropInfo)
              ).catch(errorLoading(cb));
            },
          },
          {
            path: "plants/crop_search/:crop/add",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/plants/dnd_crop_mobile.tsx").then(
                (module: any) => cb(null, module.DNDCropMobile)
              ).catch(errorLoading(cb));
            },
          },
          {
            path: "plants/:plant_id",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/plants/plant_info.tsx").then(
                (module: any) => cb(null, module.PlantInfo)
              ).catch(errorLoading(cb));
            },
          },
          {
            path: "plants/:plant_id/edit",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/plants/edit_plant_info.tsx").then(
                (module: any) => cb(null, module.EditPlantInfo)
              ).catch(errorLoading(cb));
            },
          },
          {
            path: "farm_events",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/farm_events/farm_events.tsx").then(
                (module: any) => cb(null, module.FarmEvents)
              ).catch(errorLoading(cb));
            }
          },
          {
            path: "farm_events/add",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/farm_events/add_farm_event.tsx").then(
                (module: any) => cb(null, module.AddFarmEvent)
              ).catch(errorLoading(cb));
            }
          },
          {
            path: "farm_events/:farm_event_id",
            getComponent(location: any, cb: any) {
              System.import("./farm_designer/farm_events/edit_farm_event.tsx").then(
                (module: any) => cb(null, module.EditFarmEvent)
              ).catch(errorLoading(cb));
            }
          }
        ]
      },
      {
        path: "app/regimens",
        getComponent(location: any, cb: any) {
          if (!isMobile()) {
            System.import("./regimens/index.tsx").then(
              (module: any) => cb(null, module.Regimens)
            ).catch(errorLoading(cb));
          } else {
            System.import("./regimens/list/index.tsx").then(
              (module: any) => cb(null, module.RegimensList)
            ).catch(errorLoading(cb));
          }
        },
      },
      {
        path: "app/regimens/:regimen",
        getComponent(location: any, cb: any) {
          System.import("./regimens/index.tsx").then(
            (module: any) => cb(null, module.Regimens)
          ).catch(errorLoading(cb));
        }
      },
      {
        path: "app/sequences",
        getComponent(location: any, cb: any) {
          System.import("./sequences/sequences.tsx").then(
            (module: any) => cb(null, module.Sequences)
          ).catch(errorLoading(cb));
        },
      },
      {
        path: "app/sequences/:sequence",
        getComponent(location: any, cb: any) {
          System.import("./sequences/sequences.tsx").then(
            (module: any) => cb(null, module.Sequences)
          ).catch(errorLoading(cb));
        },
      },
      {
        path: "app/tools",
        getComponent(location: any, cb: any) {
          System.import("./tools/index.tsx").then(
            (module: any) => cb(null, module.Tools)
          ).catch(errorLoading(cb));
        }
      },
      {
        path: "*",
        getComponent(location: any, cb: any) {
          System.import("./404").then(
            (module: any) => cb(null, module.FourOhFour)
          ).catch(errorLoading(cb));
        }
      }
    ]
  };

  render() {
    return <Provider store={store}>
      <Router history={history}>
        {this.routes}
      </Router>
    </Provider>;
  }
}
