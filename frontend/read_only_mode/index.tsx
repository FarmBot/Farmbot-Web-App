import { getWebAppConfig } from "../resources/getters";
import { AxiosRequestConfig } from "axios";
import { ResourceIndex } from "../resources/interfaces";
import { store } from "../redux/store";
import { warning } from "../toast/toast";
import React from "react";

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

export const readOnlyInterceptor = (config: AxiosRequestConfig) => {
  const method = (config.method || "get").toLowerCase();
  const relevant = ["put", "patch", "delete"].includes(method);

  if (relevant && appIsReadonly(store.getState().resources.index)) {
    if (!(config.url || "").includes("web_app_config")) {
      warning("Refusing to modify data in read-only mode");
      return Promise.reject(config);
    }
  }

  return Promise.resolve(config);
};

export const ReadOnlyIcon = (p: { locked: boolean }) => {
  if (p.locked) {
    return <div className="fa-stack fa-lg">
      <i className="fa fa-pencil fa-stack-1x"></i>
      <i className="fa fa-ban fa-stack-2x fa-rotate-90 text-danger"></i>
    </div>;

  } else {
    return <div />;
  }
};
