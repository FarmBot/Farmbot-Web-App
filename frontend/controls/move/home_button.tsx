import React from "react";
import { t } from "../../i18next_wrapper";
import { HomeButtonProps } from "./interfaces";
import { findHome, moveToHome } from "../../devices/actions";
import { lockedClass } from "../locked_class";

export const HomeButton = (props: HomeButtonProps) => {
  const icon = props.doFindHome ? "fa-search" : "fa-arrow-right";
  return <button
    className={[
      "home-button arrow-button fb-button",
      lockedClass(props.locked),
      props.doFindHome ? "find-home-btn" : "move-home-btn",
    ].join(" ")}
    title={props.doFindHome ? t("find home") : t("move to home")}
    onClick={() => (props.doFindHome ? findHome : moveToHome)("all")}
    disabled={props.disabled}>
    <div className={"fa-stack"}>
      <i className={"fa fa-home fa-stack-2x"} />
      <i className={`fa ${icon} fa-stack-1x`} />
    </div>
  </button>;
};
