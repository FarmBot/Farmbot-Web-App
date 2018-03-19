import { Middleware } from "redux";


const fn: Middleware = (x: Everything) => (dispatch) => (action: any) => {

  // informational_settings.controller_version
  if (isResourceReady) {
    const conf: WebAppConfig = action.payload.data;
    conf.disable_i18n && revertToEnglish();
  }

  return dispatch(action);
};
