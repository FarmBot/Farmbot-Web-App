import * as React from "react";
import { store as _store } from "./redux/store";
import { history } from "./history";
import { Store } from "./redux/interfaces";
import { ready } from "./config/actions";
import { Session } from "./session";
import { attachToRoot } from "./util";
import { ErrorBoundary } from "./error_boundary";
import { Router } from "takeme";
import { UNBOUND_ROUTES } from "./route_config";
import { App } from "./app";
import { Provider } from "react-redux";

interface RootComponentProps { store: Store; }

export const attachAppToDom = () => {
  attachToRoot(RootComponent, { store: _store });
  // tslint:disable-next-line:no-any
  _store.dispatch(ready() as any);
};

interface RootComponentState {
  Route: React.ComponentType;
  ChildRoute?: React.ComponentType;
}

export class RootComponent extends React.Component<RootComponentProps, RootComponentState> {
  state: RootComponentState = { Route: () => <div>Loading...</div> };

  UNSAFE_componentWillMount() {
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
    new Router(main_routes).enableHtml5Routing("/app").init();
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
