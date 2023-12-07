import React from "react";
import { Position } from "@blueprintjs/core";
import {
  FIRMWARE_CHOICES_DDI, isFwHardwareValue, boardType,
} from "./firmware_hardware_support";
import { flashFirmware } from "../../devices/actions";
import { t } from "../../i18next_wrapper";
import { BotState } from "../../devices/interfaces";
import { FirmwareAlerts } from "../../messages/alerts";
import { TimeSettings } from "../../interfaces";
import { Alert } from "farmbot";
import { Help, Popover } from "../../ui";
import { ToolTips } from "../../constants";

export interface StatusIconProps {
  available: boolean;
  status: boolean;
}

export const StatusIcon =
  (props: StatusIconProps) => {
    const okNoStatus = props.status ? "ok" : "no";
    const status = props.available ? okNoStatus : "unknown";
    const okNoStatusText = props.status ? t("ok") : t("error");
    const statusText = props.available ? okNoStatusText : t("unknown");
    const okNoIcon = props.status ? "fa-check-circle" : "fa-times-circle";
    const icon = props.available ? okNoIcon : "fa-question-circle";
    return <i className={`fa ${icon} status-icon ${status} fb-icon-button`}
      title={statusText} />;
  };

export const lookup = (value: string | undefined) =>
  value && Object.keys(FIRMWARE_CHOICES_DDI).includes(value)
    ? FIRMWARE_CHOICES_DDI[value].label
    : undefined;

export interface FirmwareHardwareStatusDetailsProps {
  botOnline: boolean;
  alerts: Alert[];
  apiFirmwareValue: string | undefined;
  botFirmwareValue: string | undefined;
  mcuFirmwareValue: string | undefined;
  timeSettings: TimeSettings;
  dispatch: Function;
}

interface FlashFirmwareBtnProps {
  apiFirmwareValue: string | undefined;
  botOnline: boolean;
  short?: boolean;
}

export const FlashFirmwareBtn = (props: FlashFirmwareBtnProps) => {
  const { apiFirmwareValue } = props;
  return <button className={"fb-button yellow flash-firmware"}
    disabled={!apiFirmwareValue || !props.botOnline}
    title={t("flash firmware")}
    onClick={() => isFwHardwareValue(apiFirmwareValue) &&
      flashFirmware(apiFirmwareValue)}>
    {props.short ? t("flash") : t("flash firmware")}
  </button>;
};

export const FirmwareHardwareStatusDetails =
  (props: FirmwareHardwareStatusDetailsProps) => {
    return <div className="status-details">
      <label>{t("Web App")}</label>
      <Help text={ToolTips.FIRMWARE_VALUE_API} />
      <p>{lookup(props.apiFirmwareValue) || t("unknown")}</p>
      <label>{t("FarmBot OS")}</label>
      <Help text={ToolTips.FIRMWARE_VALUE_FBOS} />
      <p>{lookup(props.botFirmwareValue) || t("unknown")}</p>
      <label>{t("Arduino/Farmduino")}</label>
      <Help text={ToolTips.FIRMWARE_VALUE_MCU} />
      <p>{lookup(props.mcuFirmwareValue) || t("unknown")}</p>
      <FirmwareAlerts
        alerts={props.alerts}
        dispatch={props.dispatch}
        apiFirmwareValue={props.apiFirmwareValue}
        timeSettings={props.timeSettings} />
    </div>;
  };

export interface FirmwareHardwareStatusProps {
  apiFirmwareValue: string | undefined;
  alerts: Alert[];
  bot: BotState;
  botOnline: boolean;
  timeSettings: TimeSettings;
  dispatch: Function;
}

export const FirmwareHardwareStatus = (props: FirmwareHardwareStatusProps) => {
  const { firmware_version } = props.bot.hardware.informational_settings;
  const { firmware_hardware } = props.bot.hardware.configuration;
  const status = props.apiFirmwareValue == firmware_hardware &&
    props.apiFirmwareValue == boardType(firmware_version);
  return <Popover position={Position.TOP}
    target={<StatusIcon
      available={!!firmware_hardware}
      status={status} />}
    content={<FirmwareHardwareStatusDetails
      alerts={props.alerts}
      botOnline={props.botOnline}
      apiFirmwareValue={props.apiFirmwareValue}
      botFirmwareValue={firmware_hardware}
      mcuFirmwareValue={boardType(firmware_version)}
      timeSettings={props.timeSettings}
      dispatch={props.dispatch} />} />;
};
