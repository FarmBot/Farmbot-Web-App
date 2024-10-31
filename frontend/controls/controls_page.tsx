import React from "react";
import { Page } from "../ui";
import { t } from "../i18next_wrapper";
import { Path } from "../internal_urls";
import { Navigate } from "react-router-dom";

/** Controls page redirect. */
export const Controls = () => {
  return <Page className="controls-page">
    <Navigate to={Path.controls()} />
    <p>{t("This page has moved. Redirecting...")}</p>
  </Page>;
};

// eslint-disable-next-line import/no-default-export
export default Controls;
