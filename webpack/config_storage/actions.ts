import { BooleanConfigKey as BooleanWebAppConfigKey } from "./web_app_configs";
import { GetState } from "../redux/interfaces";
import { getWebAppConfig } from "../resources/selectors";
import { edit, save } from "../api/crud";

/** Inverts boolean config key in WebAppConfig object, stored in the API. */
export function toggleWebAppBool(key: BooleanWebAppConfigKey) {
  return (dispatch: Function, getState: GetState) => {
    const conf = getWebAppConfig(getState().resources.index);
    if (conf) {
      const val = !conf.body[key];
      dispatch(edit(conf, { [key]: val }));
      dispatch(save(conf.uuid));
    } else {
      throw new Error("Toggled settings before app was loaded.");
    }
  };
}
