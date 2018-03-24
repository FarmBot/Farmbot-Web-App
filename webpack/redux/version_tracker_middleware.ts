import { EnvName } from "./interfaces";
import { determineInstalledOsVersion, MinVersionOverride } from "../util/index";
import { maybeGetDevice } from "../resources/selectors";
import { MW } from "./middlewares";
import { Everything } from "../interfaces";
import { Store } from "redux";
import { Dispatch } from "redux";
import { createReminderFn } from "./upgrade_reminder";

const maybeRemindUserToUpdate = createReminderFn();

function getVersionFromState(state: Everything) {
  const device = maybeGetDevice(state.resources.index);
  const v =
    determineInstalledOsVersion(state.bot, device) || MinVersionOverride.ALWAYS;
  maybeRemindUserToUpdate(v);
  return v;
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
