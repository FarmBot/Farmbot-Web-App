import { t } from "i18next";
import { error } from "farmbot-toastr";
import {
  Xhr,
  METHODS,
  notifyBotOfChanges,
  METHOD_MAP,
  SafeError,
  isSafeError
} from "./interceptor_support";
import { API } from "./api/index";
import { AuthState } from "./auth/interfaces";

export function responseFulfilled(input: Xhr): Xhr {
  let method = input.config.method;
  if (method && METHODS.includes(method)) {
    notifyBotOfChanges(input.config.url, METHOD_MAP[method]);
  };
  return input;
}

export function responseRejected(x: SafeError | undefined) {

  if (x && isSafeError(x)) {
    let a = ![451, 401, 422].includes(x.response.status);
    let b = x.response.status > 399;
    // Openfarm API was sending too many 404's.
    let c = !_.get(x, "response.config.url", "").includes("openfarm.cc/");

    if (a && b && c) {
      setTimeout(() => {
        // Explicitly throw error so error reporting tool will save it.
        let msg = `Bad response: ${x.response.status} ${JSON.stringify(x.response)}`;
        throw new Error(msg);
      }, 1);
    }
    switch (x.response.status) {
      case 404:
        // Log 404's, but don't generate any noise for the user.
        break;
      case 500:
        error(t("Unexpected error occurred, we've been notified of the problem."));
        break;
      case 451:
        // DONT REFACTOR: I want to use alert() because it's blocking.
        alert(t("The terms of service have recently changed. You must " +
          "accept the new terms of service to continue using the site."));
        window.location.href = "/tos_update.html";
        break;
    }
    return Promise.reject(x);
  } else {
    console.warn("GOT MALFORMED HTTP REJECTION?? This shouldn't happen!");
    return Promise.reject(x);
  }
}

export function requestFulfilled(auth: AuthState) {
  return (config: Axios.AxiosXHRConfig<{}>) => {
    let req = config.url;
    let isAPIRequest = req.includes(API.current.baseUrl);
    if (isAPIRequest) {
      config.headers = config.headers || {};
      let headers = (config.headers as
        { Authorization: string | undefined });
      headers.Authorization = auth.token.encoded || "CANT_FIND_TOKEN";
    }
    return config;
  };
}
