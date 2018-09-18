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
import { Router } from "takeme";
import { UNBOUND_ROUTES } from "./route_config";
import { App } from "./app";
// import { TransitionGroup, CSSTransition } from "react-transition-group";

interface RootComponentProps { store: Store; }

export const attachAppToDom: Callback = () => {
  attachToRoot(RootComponent, { store: _store });
  // tslint:disable-next-line:no-any
  _store.dispatch(ready() as any);
};

interface RootComponentState {
  CurrentRoute: React.ComponentType
}

export class RootComponent extends React.Component<RootComponentProps, RootComponentState> {
  state: RootComponentState = { CurrentRoute: () => <div>Loading...</div> };

  componentWillMount() {
    const notLoggedIn = !Session.fetchStoredToken();
    const currentLocation = history.getCurrentLocation().pathname;
    const restrictedArea = currentLocation.includes("/app");
    (notLoggedIn && restrictedArea && Session.clear());
  }

  changeRoute =
    (c: React.ComponentType) => {
      this.setState({ CurrentRoute: c });
    }

  componentDidMount() {
    const routes = UNBOUND_ROUTES.map(bindTo => bindTo(this.changeRoute));
    new Router(routes).enableHtml5Routing("/app").init();
  }

  render() {
    const { CurrentRoute } = this.state;
    try {
      return <ErrorBoundary>
        <Provider store={_store}>
          <App {...{} as App["props"]}>
            <CurrentRoute />
          </App>
        </Provider>
      </ErrorBoundary>;
    } catch (error) {
      return <p> Problem loading page.</p>;
    }
  }
}
