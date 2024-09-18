import React from "react";
import { store as _store } from "./redux/store";
import { Store } from "./redux/interfaces";
import { ready } from "./config/actions";
import { Session } from "./session";
import { attachToRoot } from "./util";
import { ErrorBoundary } from "./error_boundary";
import { Router } from "takeme";
import { UnboundRouteConfig, UNBOUND_ROUTES } from "./route_config";
import { App } from "./app";
import { ConnectedComponent, Provider } from "react-redux";
import { HotkeysProvider } from "@blueprintjs/core";
import { Provider as RollbarProvider } from "@rollbar/react";

interface RootComponentProps { store: Store; }

export const attachAppToDom = () => {
  attachToRoot(RootComponent, { store: _store });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _store.dispatch(ready() as any);
};

export type AnyConnectedComponent =
  ConnectedComponent<React.ComponentType, unknown>;

interface RootComponentState {
  Route: AnyConnectedComponent | React.FunctionComponent;
  ChildRoute?: AnyConnectedComponent;
}

export type ChangeRoute = (
  Route: AnyConnectedComponent | React.FunctionComponent,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info?: UnboundRouteConfig<any, any> | undefined,
  ChildRoute?: AnyConnectedComponent | undefined,
) => void;

export class RootComponent
  extends React.Component<RootComponentProps, RootComponentState> {
  state: RootComponentState = {
    Route: (_: { children?: React.ReactElement }) => <div>Loading...</div>
  };

  UNSAFE_componentWillMount() {
    const notLoggedIn = !Session.fetchStoredToken();
    const currentLocation = window.location.pathname;
    const restrictedArea = currentLocation.includes("/app");
    (notLoggedIn && restrictedArea && Session.clear());
  }

  changeRoute: ChangeRoute = (Route, _info, ChildRoute) => {
    this.setState({ Route, ChildRoute });
  };

  componentDidMount() {
    const mainRoutes = UNBOUND_ROUTES.map(bindTo => bindTo(this.changeRoute));
    new Router(mainRoutes).enableHtml5Routing("/app").init();
  }

  render() {
    const { ChildRoute } = this.state;
    const Route = this.state.Route as React.FunctionComponent<{
      children: React.ReactNode
    }>;
    const OuterWrapper = ({ children }: { children: React.ReactNode }) =>
      globalConfig.ROLLBAR_CLIENT_TOKEN
        ? <RollbarProvider config={{
          accessToken: globalConfig.ROLLBAR_CLIENT_TOKEN,
          captureUncaught: true,
          captureUnhandledRejections: true,
          payload: {
            person: { id: "" + (Session.fetchStoredToken()?.user.id || 0) },
            environment: window.location.host,
            client: {
              javascript: {
                source_map_enabled: true,
                code_version: globalConfig.SHORT_REVISION,
                guess_uncaught_frames: true,
              },
            },
          },
        }}>{children}</RollbarProvider>
        : <>{children}</>;

    return <OuterWrapper>
      <ErrorBoundary>
        <Provider store={_store}>
          <HotkeysProvider>
            <App>
              <Route>
                {ChildRoute &&
                  <ErrorBoundary>
                    <ChildRoute />
                  </ErrorBoundary>}
              </Route>
            </App>
          </HotkeysProvider>
        </Provider>
      </ErrorBoundary>
    </OuterWrapper>;
  }
}
