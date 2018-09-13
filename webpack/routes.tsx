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
import { ROUTES } from "./route_config_new";

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

  componentDidMount() {
    new Router(ROUTES).enableHtml5Routing("/app").init();
  }

  pageContent() {
    const { CurrentRoute } = this.state;

    return CurrentRoute ? CurrentRoute : "HMMM";
  }

  render() {
    return <ErrorBoundary>
      <Provider store={_store}>
        {this.pageContent()}
      </Provider>
    </ErrorBoundary>;
  }
}
