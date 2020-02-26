import { AxiosRequestConfig } from "axios";
import { store } from "../redux/store";
import { warning } from "../toast/toast";
import React from "react";
import { appIsReadonly } from "./app_is_read_only";
import { t } from "../i18next_wrapper";

export const readOnlyInterceptor = (config: AxiosRequestConfig) => {
  const method = (config.method || "get").toLowerCase();
  const relevant = ["put", "patch", "delete"].includes(method);

  if (relevant && appIsReadonly(store.getState().resources.index)) {
    if (!(config.url || "").includes("web_app_config")) {
      warning(t("Refusing to modify data in read-only mode"));
      return Promise.reject(config);
    }
  }

  return Promise.resolve(config);
};

export const ReadOnlyIcon = (p: { locked: boolean }) => {
  if (p.locked) {
    return <div className=" read-only-icon fa-stack fa-lg">
      <i className="fa fa-pencil fa-stack-1x" />
      <i className="fa fa-ban fa-stack-2x fa-rotate-90 text-danger" />
    </div>;
  } else {
    return <div />;
  }
};
