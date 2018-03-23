import { EnvName } from "./interfaces";
import { determineInstalledOsVersion } from "../util/index";
import { maybeGetDevice } from "../resources/selectors";
import { MW } from "./middlewares";
import { Everything } from "../interfaces";
import { Store } from "redux";
import { Dispatch } from "redux";

const NULL_VERSION = "NONE";

function getVersionFromState(state: Everything) {
  const device = maybeGetDevice(state.resources.index);
  return determineInstalledOsVersion(state.bot, device) || NULL_VERSION;
}

const fn: MW =
  (store: Store<Everything>) =>
    (dispatch: Dispatch<object>) =>
      (action: any) => {
        const fbos = getVersionFromState(store.getState());
        window.Rollbar && window.Rollbar.configure({ payload: { fbos } });
        return dispatch(action);
      };

const env: EnvName = "*";

export const versionChangeMiddleware = { env, fn };
