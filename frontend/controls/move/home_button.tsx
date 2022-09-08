import React from "react";
import { t } from "../../i18next_wrapper";
import { HomeButtonProps } from "./interfaces";
import { findHome, moveToHome } from "../../devices/actions";
import { lockedClass } from "../locked_class";
import { Popover } from "../../ui";
import { setMovementStateFromPosition } from "../../connectivity/log_handlers";
import { awayFromHome } from "../../farm_designer/map/layers/logs/logs_layer";

export const HomeButton = (props: HomeButtonProps) => {
  const { doFindHome, homeDirection, locked, arduinoBusy, botOnline } = props;
  const icon = doFindHome ? "fa-search" : "fa-arrow-right";
  const style = doFindHome ? {} : { transform: `rotate(${homeDirection}deg)` };
  const disabled = arduinoBusy || !botOnline;
  const alreadyAtHome = !doFindHome && !awayFromHome(props.botPosition, 0.5);
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [popoverText, setPopoverText] = React.useState("");
  const sendCommand = () => {
    props.setActivePopover(icon);
    props.dispatch(setMovementStateFromPosition(props.botPosition));
    const text = () => {
      if (locked) { return t("FarmBot is locked"); }
      if (arduinoBusy) { return t("FarmBot is busy"); }
      if (!botOnline) { return t("FarmBot is offline"); }
      if (alreadyAtHome) { return t("FarmBot is already at the home position"); }
      return "";
    };
    if (arduinoBusy || !botOnline || locked || alreadyAtHome) {
      setPopoverOpen(!popoverOpen);
      setPopoverText(text());
      return;
    }
    setPopoverOpen(false);
    setPopoverText(text());
    (doFindHome ? findHome : moveToHome)("all");
  };
  return <button
    className={[
      "home-button arrow-button fb-button",
      lockedClass(locked),
      doFindHome ? "find-home-btn" : "move-home-btn",
      disabled ? "pseudo-disabled" : "",
    ].join(" ")}
    title={doFindHome ? t("find home") : t("move to home")}
    onClick={sendCommand}>
    <div className={"fa-stack"}>
      <i className={"fa fa-home fa-stack-2x"} />
      <i className={`fa ${icon} fa-stack-1x`} style={style} />
    </div>
    <Popover
      isOpen={props.popover == icon && popoverOpen}
      popoverClassName={"help movement-message"}
      target={<i />}
      content={<div className={"help-text-content"}>
        {t(popoverText)}
      </div>} />
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
