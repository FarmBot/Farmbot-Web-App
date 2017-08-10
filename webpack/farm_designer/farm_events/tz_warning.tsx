import * as React from "react";
import { t } from "i18next";
import { timezoneMismatch } from "../../devices/timezones/guess_timezone";


const WARNING = `Note: Times displayed according to local browser time, which
is currently different from your device timezone setting (on the Device page).`;

interface TzWarningProps {
  deviceTimezone: string | undefined;
}

export function TzWarning({ deviceTimezone }: TzWarningProps) {
  return <div className="note">
    {timezoneMismatch(deviceTimezone) ? t(WARNING) : ""}
  </div>;
}
