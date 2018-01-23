import { Middleware } from "redux";
import { Actions } from "../constants";
import { MiddlewareConfig } from "./middlewares";
import { ResourceName } from "../resources/tagged_resources";
import { revertToEnglish } from "../revert_to_english";
import { WebAppConfig } from "../config_storage/web_app_configs";
const WEB_APP_CONFIG: ResourceName = "WebAppConfig";

const fn: Middleware =
  (store) => (next) => (action: any) => {
    const isResourceReady = action && action.type === Actions.RESOURCE_READY;
    if (isResourceReady
      && action.payload.name === WEB_APP_CONFIG
      && action.payload) {
      const conf: WebAppConfig = action.payload.data;
      conf.disable_i18n && revertToEnglish();
    }
    return next(action);
  };

export const idea: MiddlewareConfig = { fn, env: "*" };
