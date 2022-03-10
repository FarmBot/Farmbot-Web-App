import React from "react";
import { t } from "../i18next_wrapper";
import { TaggedSensor } from "farmbot";
import { Content } from "../constants";
import { readPin } from "../devices/actions";
import { isBotOnlineFromState } from "../devices/must_be_online";
import { error } from "../toast/toast";
import { ToolVerificationProps } from "./interfaces";

const toolStatus = (value: number | undefined): string => {
  switch (value) {
    case 1: return t("disconnected");
    case 0: return t("connected");
    default: return t("unknown");
  }
};

export const ToolVerification = (props: ToolVerificationProps) => {
  const toolVerificationSensor =
    props.sensors.filter(sensor => sensor.body.label.toLowerCase()
      .includes("tool verification"))[0] as TaggedSensor | undefined;
  const toolVerificationPin = toolVerificationSensor
    ? toolVerificationSensor.body.pin || 63
    : 63;
  const pins = props.bot.hardware.pins;
  const pinData = pins[toolVerificationPin];
  const toolVerificationValue = pinData ? pinData.value : undefined;
  const arduinoBusy = !!props.bot.hardware.informational_settings.busy;
  const botOnline = isBotOnlineFromState(props.bot);
  return <div className="tool-verification-status">
    <p>{t("status")}: {toolStatus(toolVerificationValue)}</p>
    <button
      className={`fb-button yellow ${botOnline ? "" : "pseudo-disabled"}`}
      disabled={arduinoBusy}
      title={botOnline ? "" : t(Content.NOT_AVAILABLE_WHEN_OFFLINE)}
      onClick={() => {
        botOnline
          ? readPin(toolVerificationPin,
            `pin${toolVerificationPin}`, 0)
          : error(t(Content.NOT_AVAILABLE_WHEN_OFFLINE));
      }}>
      {t("verify")}
    </button>
  </div>;
};
