import React from "react";
import { t } from "../../i18next_wrapper";
import { HomeButtonProps } from "./interfaces";
import { findHome, moveToHome } from "../../devices/actions";
import { lockedClass } from "../locked_class";

export const HomeButton = (props: HomeButtonProps) => {
  const { doFindHome, homeDirection, locked, arduinoBusy, botOnline } = props;
  const icon = doFindHome ? "fa-search" : "fa-arrow-right";
  const style = doFindHome ? {} : { transform: `rotate(${homeDirection}deg)` };
  return <button
    className={[
      "home-button arrow-button fb-button",
      lockedClass(locked),
      doFindHome ? "find-home-btn" : "move-home-btn",
    ].join(" ")}
    title={doFindHome ? t("find home") : t("move to home")}
    onClick={() => (doFindHome ? findHome : moveToHome)("all")}
    disabled={arduinoBusy || !botOnline}>
    <div className={"fa-stack"}>
      <i className={"fa fa-home fa-stack-2x"} />
      <i className={`fa ${icon} fa-stack-1x`} style={style} />
    </div>
  </button>;
};

/** Rotation angle in degrees for arrow pointing to the right. */
export const calculateHomeDirection =
  (leftPositive: boolean, upPositive: boolean) => {
    if (leftPositive && upPositive) { return 45; }
    if (leftPositive && !upPositive) { return -45; }
    if (!leftPositive && upPositive) { return 135; }
    if (!leftPositive && !upPositive) { return -135; }
  };
