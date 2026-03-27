import { EnvName } from "./interfaces";
import { determineInstalledOsVersion, FbosVersionFallback } from "../util/index";
import { maybeGetDevice } from "../resources/selectors";
import { Everything } from "../interfaces";
import { Store, Middleware } from "redux";
import { createReminderFn } from "./upgrade_reminder";

const maybeRemindUserToUpdate = createReminderFn();

function getVersionFromState(state: Everything) {
  const device = maybeGetDevice(state.resources.index);
  const version = determineInstalledOsVersion(state.bot, device)
    || FbosVersionFallback.NULL;
  maybeRemindUserToUpdate(version);
  return version;
}

const fn: Middleware =
  store =>
    dispatch =>
      action => {
        const fbos = getVersionFromState((store as Store<Everything>).getState());
        window.Rollbar?.configure({ payload: { fbos } });
        return dispatch(action);
      };

const env: EnvName = "*";

export const versionChangeMiddleware = { env, fn };
