import "./css/_index.scss";
import * as React from "react";
import { Provider } from "react-redux";
import { Router, RedirectFunction, RouterState } from "react-router";
import { App } from "./app";
import { store as _store } from "./redux/store";
import { history } from "./history";
import { Store } from "./redux/interfaces";
import { ready } from "./config/actions";
import { Session } from "./session";
import { attachToRoot } from "./util";
import { Callback } from "i18next";
import { crashPage } from "./crash_page";

const key = "Jan 20 23:52";

if (!localStorage[key]) {
  localStorage[key] = JSON.stringify("X");
  location.reload(true);
}

interface RootComponentProps {
  store: Store;
}

const controlsRoute = {
  path: "app/controls",
  getComponent(_discard: void, cb: Function) {
    import("./controls/controls")
      .then((module) => cb(undefined, module.Controls))
      .catch((e: object) => cb(undefined, crashPage(e)));
  }
};

export const attachAppToDom: Callback = (err, t) => {
  attachToRoot(RootComponent, { store: _store });
  _store.dispatch(ready());
};

export class RootComponent extends React.Component<RootComponentProps, {}> {

  /** These methods are a way to determine how to load certain modules
   * based on the device (mobile or desktop) for optimization/css purposes.
   * Open to revision.
   */
  private maybeReplaceDesignerModules(next: RouterState, replace: RedirectFunction) {
    if (next.location.pathname === "/app/designer") {
      replace(`${next.location.pathname}/plants`);
    }
  }
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

  private routes = {
    component: App,
    indexRoute: controlsRoute,
    childRoutes: [
      {
        path: "app/account",
        getComponent(_discard: void, cb: Function) {
          import("./account/index")
            .then(module => cb(undefined, module.Account))
            .catch((e: object) => cb(undefined, crashPage(e)));
        }
      },
      controlsRoute,
      {
        path: "app/device",
        getComponent(_discard: void, cb: Function) {
          import("./devices/devices")
            .then(module => cb(undefined, module.Devices))
            .catch((e: object) => cb(undefined, crashPage(e)));
        }
      },
      {
        path: "app/farmware",
        getComponent(_discard: void, cb: Function) {
          import("./farmware/index")
            .then(module => cb(undefined, module.FarmwarePage))
            .catch((e: object) => cb(undefined, crashPage(e)));
        }
      },
      {
        path: "app/designer",
        onEnter: this.maybeReplaceDesignerModules.bind(this),
        getComponent(_discard: void, cb: Function) {
          import("./farm_designer/index")
            .then(module => cb(undefined, module.FarmDesigner))
            .catch((e: object) => cb(undefined, crashPage(e)));
        },
        childRoutes: [
          {
            path: "plants",
            getComponent(_discard: void, cb: Function) {
              import("./farm_designer/plants/plant_inventory")
                .then(module => cb(undefined, module.Plants))
                .catch((e: object) => cb(undefined, crashPage(e)));
            },
          },
          {
            path: "plants/crop_search",
            getComponent(_discard: void, cb: Function) {
              import("./farm_designer/plants/crop_catalog")
                .then(module => cb(undefined, module.CropCatalog))
                .catch((e: object) => cb(undefined, crashPage(e)));
            },
          },
          {
            path: "plants/crop_search/:crop",
            getComponent(_discard: void, cb: Function) {
              import("./farm_designer/plants/crop_info")
                .then(module => cb(undefined, module.CropInfo))
                .catch((e: object) => cb(undefined, crashPage(e)));
            },
          },
          {
            path: "plants/crop_search/:crop/add",
            getComponent(_discard: void, cb: Function) {
              import("./farm_designer/plants/add_plant")
                .then(module => cb(undefined, module.AddPlant))
                .catch((e: object) => cb(undefined, crashPage(e)));
            },
          },
          {
            path: "plants/select",
            getComponent(_discard: void, cb: Function) {
              import("./farm_designer/plants/select_plants")
                .then(module => cb(undefined, module.SelectPlants))
                .catch((e: object) => cb(undefined, crashPage(e)));
            },
          },
          {
            path: "plants/move_to",
            getComponent(_discard: void, cb: Function) {
              import("./farm_designer/plants/move_to")
                .then(module => cb(undefined, module.MoveTo))
                .catch((e: object) => cb(undefined, crashPage(e)));
            },
          },
          {
            path: "plants/create_point",
            getComponent(_discard: void, cb: Function) {
              import("./farm_designer/plants/create_points")
                .then(module => cb(undefined, module.CreatePoints))
                .catch((e: object) => cb(undefined, crashPage(e)));
            },
          },
          {
            path: "plants/:plant_id",
            getComponent(_discard: void, cb: Function) {
              import("./farm_designer/plants/plant_info")
                .then(module => cb(undefined, module.PlantInfo))
                .catch((e: object) => cb(undefined, crashPage(e)));
            },
          },
          {
            path: "plants/:plant_id/edit",
            getComponent(_discard: void, cb: Function) {
              import("./farm_designer/plants/edit_plant_info")
                .then(module => cb(undefined, module.EditPlantInfo))
                .catch((e: object) => cb(undefined, crashPage(e)));
            },
          },
          {
            path: "farm_events",
            getComponent(_discard: void, cb: Function) {
              import("./farm_designer/farm_events/farm_events")
                .then(module => cb(undefined, module.FarmEvents))
                .catch((e: object) => cb(undefined, crashPage(e)));
            }
          },
          {
            path: "farm_events/add",
            getComponent(_discard: void, cb: Function) {
              import("./farm_designer/farm_events/add_farm_event")
                .then(module => cb(undefined, module.AddFarmEvent))
                .catch((e: object) => cb(undefined, crashPage(e)));
            }
          },
          {
            path: "farm_events/:farm_event_id",
            getComponent(_discard: void, cb: Function) {
              import("./farm_designer/farm_events/edit_farm_event")
                .then(module => cb(undefined, module.EditFarmEvent))
                .catch((e: object) => cb(undefined, crashPage(e)));
            }
          }
        ]
      },
      {
        path: "app/regimens",
        getComponent(_discard: void, cb: Function) {
          import("./regimens/index")
            .then(module => cb(undefined, module.Regimens))
            .catch((e: object) => cb(undefined, crashPage(e)));
        },
      },
      {
        path: "app/regimens/:regimen",
        getComponent(_discard: void, cb: Function) {
          import("./regimens/index")
            .then(module => cb(undefined, module.Regimens))
            .catch((e: object) => cb(undefined, crashPage(e)));
        }
      },
      {
        path: "app/sequences",
        getComponent(_discard: void, cb: Function) {
          import("./sequences/sequences")
            .then(module => {
              cb(undefined, module.Sequences);
            })
            .catch((e: object) => cb(undefined, crashPage(e)));
        },
      },
      {
        path: "app/sequences/:sequence",
        getComponent(_discard: void, cb: Function) {
          import("./sequences/sequences")
            .then(module => cb(undefined, module.Sequences))
            .catch((e: object) => cb(undefined, crashPage(e)));
        },
      },
      {
        path: "app/tools",
        getComponent(_discard: void, cb: Function) {
          import("./tools/index")
            .then(module => cb(undefined, module.Tools))
            .catch((e: object) => cb(undefined, crashPage(e)));
        }
      },
      {
        path: "app/logs",
        getComponent(_discard: void, cb: Function) {
          import("./logs/index")
            .then(module => cb(undefined, module.Logs))
            .catch((e: object) => cb(undefined, crashPage(e)));
        }
      },
      {
        path: "*",
        getComponent(_discard: void, cb: Function) {
          import("./404")
            .then(module => cb(undefined, module.FourOhFour))
            .catch((e: object) => cb(undefined, crashPage(e)));
        }
      }
    ]
  };

  render() {
    // ==== TEMPORARY HACK. TODO: Add a before hook, if such a thing exists in
    // React Router. Or switch routing libs.
    const notLoggedIn = !Session.fetchStoredToken();
    const restrictedArea = window.location.pathname.includes("/app");
    if (notLoggedIn && restrictedArea) {
      Session.clear();
    }
    // ==== END HACK ====
    return <Provider store={_store}>
      <Router history={history}>
        {this.routes}
      </Router>
    </Provider>;
  }
}
