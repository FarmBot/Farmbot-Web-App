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
    let i = this.props.bot.hardware.informational_settings;
    let { sync_status } = i;
    let lock1 = !!i.locked;
    let lock2 = sync_status === LOCKED;
    let isLocked = lock1 || lock2;
    let toggleEmergencyLock = isLocked ? emergencyUnlock : emergencyLock;
    let emergencyLockStatusColor = isLocked ? "yellow" : "red";
    let emergencyLockStatusText = isLocked ? "UNLOCK" : "E-STOP";

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
