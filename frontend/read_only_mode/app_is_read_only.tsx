import { getWebAppConfig } from "../resources/getters";
import { ResourceIndex } from "../resources/interfaces";
/** Returns `true` if the user is allowed to modify account data.
 * This is a helper function of the "readonly" account lock. */
export function appIsReadonly(index: ResourceIndex) {
  const conf = getWebAppConfig(index);
  if (conf) {
    return conf.body.user_interface_read_only_mode;
  } else {
    // Assume user is allowed to change data if no
    // configs are available.
    return true;
  }
}
