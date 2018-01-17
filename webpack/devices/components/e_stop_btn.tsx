import * as React from "react";
import { t } from "i18next";
import { emergencyLock, emergencyUnlock } from "../actions";
import { EStopButtonProps } from "../interfaces";

export class EStopButton extends React.Component<EStopButtonProps, {}> {
  render() {
    const i = this.props.bot.hardware.informational_settings;
    const isLocked = !!i.locked;
    const toggleEmergencyLock = isLocked ? emergencyUnlock : emergencyLock;
    const emergencyLockStatusColor = "red";
    const emergencyLockStatusText = isLocked ? "UNLOCK" : "E-STOP";

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
