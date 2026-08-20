import React from "react";
import { store as _store } from "./redux/store";
import { Store } from "./redux/interfaces";
import { ready } from "./config/actions";
import { Session } from "./session";
import { attachToRoot } from "./util";
import { ErrorBoundary } from "./error_boundary";
import { Route, BrowserRouter, Routes } from "react-router";
import { ROUTE_DATA } from "./route_config";
import { Provider } from "react-redux";
import { BlueprintProvider } from "@blueprintjs/core";
import { Provider as RollbarProvider } from "@rollbar/react";
import { NavigationProvider } from "./routes_helpers";
import { App } from "./app";

interface RootComponentProps { store: Store; }

interface RollbarTrace {
  frames?: { filename?: string }[];
}

interface RollbarPayload {
  body?: {
    trace?: RollbarTrace;
    trace_chain?: RollbarTrace[];
  };
}

export const normalizeRollbarAssetUrls = (payload: RollbarPayload) => {
  const traces = [payload.body?.trace, ...(payload.body?.trace_chain || [])];
  traces.forEach(trace => {
    trace?.frames?.forEach(frame => {
      const filename = frame.filename;
      if (filename) {
        frame.filename = filename.replace(
          /^(https?):\/\/[^/]+(\/assets\/dist\/)/,
          "$1://dynamichost$2",
        );
      }
    });
  });
};

export const attachAppToDom = () => {
  attachToRoot(RootComponent, { store: _store });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _store.dispatch(ready() as any);
};

export class RootComponent
  extends React.Component<RootComponentProps> {

  UNSAFE_componentWillMount() {
    const notLoggedIn = !Session.fetchStoredToken();
    const currentLocation = window.location.pathname;
    const restrictedArea = currentLocation.includes("/app");
    (notLoggedIn && restrictedArea && Session.clear());
  }

  render() {
    const OuterWrapper = ({ children }: { children: React.ReactNode }) =>
      globalConfig.ROLLBAR_CLIENT_TOKEN
        ? <RollbarProvider config={{
          accessToken: globalConfig.ROLLBAR_CLIENT_TOKEN,
          captureUncaught: true,
          captureUnhandledRejections: true,
          transform: (payload: RollbarPayload) =>
            normalizeRollbarAssetUrls(payload),
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
          <BlueprintProvider>
            <BrowserRouter>
              <NavigationProvider>
                <React.Suspense>
                  <Routes>
                    <Route
                      path={"/app"}
                      element={<App />}>
                      {ROUTE_DATA.map(appRoute =>
                        <Route key={appRoute.path}
                          path={appRoute.path}
                          element={appRoute.element}>
                          {appRoute.children &&
                            appRoute.children.map(designerRoute =>
                              <Route key={designerRoute.path}
                                path={designerRoute.path}
                                element={designerRoute.element} />)}
                        </Route>)}
                    </Route>
                  </Routes>
                </React.Suspense>
              </NavigationProvider>
            </BrowserRouter>
          </BlueprintProvider>
        </Provider>
      </ErrorBoundary>
    </OuterWrapper>;
  }
}
