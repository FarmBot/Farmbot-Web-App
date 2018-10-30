import { Middleware, DeepPartial } from "redux";
import { MiddlewareConfig } from "./middlewares";
import { ResourceName, TaggedWebAppConfig } from "farmbot";
import { Actions } from "../constants";
import { revertToEnglish } from "../revert_to_english";
import { SyncResponse } from "../sync/actions";
import { arrayUnwrap } from "../resources/util";

const WEB_APP_CONFIG: ResourceName = "WebAppConfig";

/**
 * When the app first loads, everything is localized. Some users do not wish to
 * localize the app and would like instead to leave the app in English.
 *
 * Unfortunately, the setting to do this lives on the API in the `WebAppConfig`
 * table and we do not have access to that information until after the app
 * bootstraps.
 *
 * To get around this limitation, we internationalize the app as soon as
 * possible and then revert to english as soon as we have a chance to read the
 * value of `web_app_config.disable_i18n`.
 */
// tslint:disable-next-line:no-any
const fn: Middleware = () => (dispatch) => (action: any) => {
  const x: DeepPartial<SyncResponse<TaggedWebAppConfig>> = action;
  if (x
    && x.type === Actions.RESOURCE_READY
    && x.payload
    && x.payload.body
    && x.payload.kind === WEB_APP_CONFIG) {
    const conf = arrayUnwrap(x.payload.body);
    conf
      && conf.body
      && conf.body.disable_i18n
      && revertToEnglish();
  }

  return dispatch(action);
};

export const revertToEnglishMiddleware: MiddlewareConfig = { fn, env: "*" };
