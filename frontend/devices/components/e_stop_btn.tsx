import * as React from "react";
import { emergencyLock, emergencyUnlock } from "../actions";
import { EStopButtonProps } from "../interfaces";
import { isBotUp } from "../must_be_online";
import { t } from "../../i18next_wrapper";

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
    const emergencyLockStatusText = isLocked ? t("UNLOCK") : "E-STOP";

    return <button
      title={isLocked ? t("unlock device") : t("emergency stop")}
      className={`fb-button red e-stop ${emergencyLockStatusColor}`}
      onClick={toggleEmergencyLock}>
      {t(emergencyLockStatusText)}
    </button>;
  }
}
