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
import { NavigationProvider } from "./routes_helpers";
import { App } from "./app";
import { RollbarWrapper } from "./rollbar";

interface RootComponentProps { store: Store; }

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
    return <RollbarWrapper>
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
    </RollbarWrapper>;
  }
}
