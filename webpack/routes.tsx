import "./css/_index.scss";
import * as React from "react";
import { Provider } from "react-redux";
import { store as _store } from "./redux/store";
import { history } from "./history";
import { Store } from "./redux/interfaces";
import { ready } from "./config/actions";
import { Session } from "./session";
import { attachToRoot } from "./util";
import { Callback } from "i18next";
import { ErrorBoundary } from "./error_boundary";
import { Router, RouteConfig } from "takeme";
import { UNBOUND_ROUTES, NOT_FOUND_ROUTE } from "./route_config";
import { App } from "./app";
import { Experimental, DesignerRouteName, BIG_LOOKUP } from "./experimental/experimental";
import { routeChange } from "./experimental/reducer";
import { FarmDesigner } from "./farm_designer";

interface RootComponentProps { store: Store; }

export const attachAppToDom: Callback = () => {
  attachToRoot(RootComponent, { store: _store });
  // tslint:disable-next-line:no-any
  _store.dispatch(ready() as any);
};

interface RootComponentState {
  Route: React.ComponentType;
  ChildRoute?: React.ComponentType;
}

const FARM_DESIGNER = () => <FarmDesigner {...({} as any)} />;

export class RootComponent extends React.Component<RootComponentProps, RootComponentState> {
  state: RootComponentState = { Route: () => <div>Loading...</div> };

  componentWillMount() {
    const notLoggedIn = !Session.fetchStoredToken();
    const currentLocation = history.getCurrentLocation().pathname;
    const restrictedArea = currentLocation.includes("/app");
    (notLoggedIn && restrictedArea && Session.clear());
  }

  changeRoute =
    (Route: React.ComponentType, ChildRoute?: React.ComponentType) => {
      this.setState({ Route: Route, ChildRoute });
    };

  componentDidMount() {
    const main_routes = UNBOUND_ROUTES.map(bindTo => bindTo(this.changeRoute));
    const designer_routes = Object
      .values(DesignerRouteName)
      .map(($): RouteConfig => {
        return {
          $: $,
          enter: async () => {
            _store.dispatch(routeChange($));
            const fn = BIG_LOOKUP[$];
            if (fn) {
              const child = await fn();
              this.changeRoute(FARM_DESIGNER, child);
            }
          }
        };
      });
    new Router([
      ...main_routes,
      ...designer_routes,
      NOT_FOUND_ROUTE(this.changeRoute)
    ]).enableHtml5Routing("/app").init();
  }

  render() {
    const { Route } = this.state;
    const { ChildRoute } = this.state;
    const props = ChildRoute ? { children: <ChildRoute /> } : {};
    try {
      return <ErrorBoundary>
        <Provider store={_store}>
          <App {...{} as App["props"]}>
            <Route {...props} />
          </App>
        </Provider>
      </ErrorBoundary>;
    } catch (error) {
      return <p> Problem loading page.</p>;
    }
  }
}
