import * as React from "react";
import { t } from "i18next";
import { emergencyLock, emergencyUnlock } from "../actions";
import { EStopButtonProps } from "../interfaces";
import { SyncStatus } from "farmbot/dist";
// Leave this here. Type checker will notify us if we ever need to change
// this string.
const LOCKED: SyncStatus = "locked";

export class EStopButton extends React.Component<EStopButtonProps, {}> {
  render() {
    let { sync_status } = this.props.bot.hardware.informational_settings;
    let locked = sync_status === LOCKED;
    let toggleEmergencyLock = locked ? emergencyUnlock : emergencyLock;
    let emergencyLockStatusColor = locked ? "yellow" : "red";
    let emergencyLockStatusText = locked ? "UNLOCK" : "E-STOP";

    if (this.props.user) {
      return <button
        className={`fb-button red e-stop ${emergencyLockStatusColor}`}
        onClick={toggleEmergencyLock}>
        {t(emergencyLockStatusText)}
      </button>;
    } else {
      return <span></span>;
    }
  }
}
