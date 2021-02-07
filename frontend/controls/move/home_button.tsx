import React from "react";
import { t } from "../../i18next_wrapper";
import { HomeButtonProps } from "./interfaces";
import { findHome, homeAll } from "../../devices/actions";

export const HomeButton = (props: HomeButtonProps) => {
  const icon = props.doFindHome ? "fa-search" : "fa-arrow-right";
  return <button
    className={"home-button arrow-button fb-button"}
    title={props.doFindHome ? t("find home") : t("move to home")}
    onClick={props.doFindHome ? () => findHome("all") : () => homeAll(100)}
    disabled={props.disabled}>
    <div className={"fa-stack"}>
      <i className={"fa fa-home fa-stack-2x"} />
      <i className={`fa ${icon} fa-stack-1x`} />
    </div>
  </button>;
};
