import React from "react";
import { emergencyLock, emergencyUnlock } from "../devices/actions";
import { EStopButtonProps } from "./interfaces";
import { isBotUp } from "../devices/must_be_online";
import { t } from "../i18next_wrapper";

const GRAY = "pseudo-disabled";

export class EStopButton extends React.Component<EStopButtonProps, {}> {
  render() {
    const i = this.props.bot.hardware.informational_settings;
    const isLocked = !!i.locked;
    const toggleEmergencyLock = isLocked
      ? () => emergencyUnlock(this.props.forceUnlock)
      : emergencyLock;
    const color = isLocked ? "yellow" : "red";
    const emergencyLockStatusColor = isBotUp(i.sync_status) ? color : GRAY;
    const stop = window.innerWidth <= 450
      ? <i className={"fa fa-pause"} />
      : t("E-STOP");
    const emergencyLockStatusText = isLocked ? t("UNLOCK") : stop;

    return <button
      title={isLocked ? t("unlock device") : t("emergency stop")}
      className={`fb-button red e-stop ${emergencyLockStatusColor}`}
      onClick={toggleEmergencyLock}>
      {emergencyLockStatusText}
    </button>;
  }
}
