import { t } from "i18next";
import { error } from "farmbot-toastr";
import {
  SafeError,
  isSafeError
} from "./interceptor_support";
import { API } from "./api/index";
import { AuthState } from "./auth/interfaces";
import * as _ from "lodash";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { Content } from "./constants";
import { dispatchNetworkUp, dispatchNetworkDown } from "./connectivity/index";
import { Dictionary } from "farmbot";
import { outstandingRequests } from "./connectivity/data_consistency";
import { Session } from "./session";

export function responseFulfilled(input: AxiosResponse): AxiosResponse {
  dispatchNetworkUp("user.api");
  return input;
}

/** These will raise type errors if our _.get usage ever requires changing. */
const request: keyof SafeError = "request";
const responseUrl: keyof SafeError["request"] = "responseURL";

export const isLocalRequest = (x: SafeError) =>
  _.get(x, [request, responseUrl], "").includes(API.current.baseUrl);

let ONLY_ONCE = true;
export function responseRejected(x: SafeError | undefined) {
  if (x && isSafeError(x)) {
    dispatchNetworkUp("user.api");
    const a = ![451, 401, 422].includes(x.response.status);
    const b = x.response.status > 399;
    // Openfarm API was sending too many 404's.
    const c = !_.get(x, "response.config.url", "").includes("openfarm.cc/");
    if (a && b && c) {
      setTimeout(() => {
        // Explicitly throw error so error reporting tool will save it.
        const msg = `Bad response: ${x.response.status} ${JSON.stringify(x.response)}`;
        throw new Error(msg);
      }, 1);
    }
    switch (x.response.status) {
      case 401:
        isLocalRequest(x) && Session.clear();
        break;
      case 404:
        // Log 404's, but don't generate any noise for the user.
        break;
      case 500:
        error(t("Unexpected error occurred, we've been notified of the problem."));
        break;
      case 451:
        // DONT REFACTOR: I want to use alert() because it's blocking.
        ONLY_ONCE && alert(t(Content.TOS_UPDATE));
        ONLY_ONCE = false;
        window.location.assign("/tos_update");
        break;
    }
    return Promise.reject(x);
  } else {
    dispatchNetworkDown("user.api");
    return Promise.reject(x);
  }
}

export function requestFulfilled(auth: AuthState) {
  return (config: AxiosRequestConfig) => {
    const req = config.url || "";
    const isAPIRequest = req.includes(API.current.baseUrl);
    if (isAPIRequest) {
      config.headers = config.headers || {};
      const headers: Dictionary<string> = config.headers;
      headers["X-Farmbot-Rpc-Id"] = outstandingRequests.last;
      headers.Authorization = auth.token.encoded || "CANT_FIND_TOKEN";
    }
    return config;
  };
}
