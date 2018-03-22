import { EnvName } from "./interfaces";
import { determineInstalledOsVersion } from "../util/index";
import { maybeGetDevice } from "../resources/selectors";
import { MW } from "./middlewares";
import { Everything } from "../interfaces";
import { Store } from "redux";
import { Dispatch } from "redux";

const fn: MW =
  (store: Store<Everything>) =>
    (dispatch: Dispatch<object>) =>
      (action: any) => {
        if (window.Rollbar) {
          const state = store.getState();
          const device = maybeGetDevice(state.resources.index);
          if (device) {
            window
              .Rollbar
              .configure({
                payload: {
                  fbos: determineInstalledOsVersion(state.bot, device) || "NONE"
                }
              });
          }
        }
        return dispatch(action);
      };

const env: EnvName = "*";

export const versionChangeMiddleware = { env, fn };
