import { Dictionary } from "farmbot";
import { t } from "i18next";
import * as _ from "lodash";

export interface AxiosErrorResponse {
  response?: {
    data: {
      [reason: string]: string
    };
  };
}

/** Concats and capitalizes all of the error key/value
 *  pairs returned by the /api/xyz endpoint. */
export function prettyPrintApiErrors(err: AxiosErrorResponse) {
  return _.map(safelyFetchErrors(err),
    (v, k) => `${("" + k).split("_").join(" ")}: ${v.toString()}`.toLowerCase())
    .map(str => _.capitalize(str)).join(" ");
}

function safelyFetchErrors(err: AxiosErrorResponse): Dictionary<string> {
  // In case the interpreter gives us an oddball error message.
  if (err && err.response && err.response.data) {
    return err.response.data;
  } else {
    return {
      error: t("Your web browser is unable to communicate with the " +
        "web app server. Make sure you are connected to the Internet.")
    };
  }
}

export function bail(message: string): never {
  throw new Error(message);
}

export const catchErrors = (error: Error) => {
  if (window.Rollbar && window.Rollbar.error) {
    window.Rollbar.error(error);
  } else {
    throw error;
  }
};
