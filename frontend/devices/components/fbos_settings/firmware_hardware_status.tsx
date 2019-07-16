import * as React from "react";
import { Popover, Position } from "@blueprintjs/core";
import { FIRMWARE_CHOICES_DDI } from "../firmware_hardware_support";
import { flashFirmware } from "../../actions";
import { t } from "../../../i18next_wrapper";
import { BotState, Feature, ShouldDisplay } from "../../interfaces";
import { FirmwareAlerts } from "../../../messages/alerts";
import { TimeSettings } from "../../../interfaces";
import { trim } from "../../../util";
import { Alert } from "farmbot";
import { isFwHardwareValue, boardType } from "../firmware_hardware_support";

export interface FirmwareHardwareStatusIconProps {
  firmwareHardware: string | undefined;
  status: boolean;
}

export const FirmwareHardwareStatusIcon =
  (props: FirmwareHardwareStatusIconProps) => {
    const okNoStatus = props.status ? "ok" : "no";
    const status = props.firmwareHardware ? okNoStatus : "unknown";
    const okNoStatusText = props.status ? t("ok") : t("error");
    const statusText = props.firmwareHardware ? okNoStatusText : t("unknown");
    const okNoIcon = props.status ? "fa-check-circle" : "fa-times-circle";
    const icon = props.firmwareHardware ? okNoIcon : "fa-question-circle";
    return <i className={`fa ${icon} status-icon ${status}`} title={statusText} />;
  };

const lookup = (value: string | undefined) =>
  value && Object.keys(FIRMWARE_CHOICES_DDI).includes(value)
    ? FIRMWARE_CHOICES_DDI[value].label : undefined;

export interface FirmwareHardwareStatusDetailsProps {
  botOnline: boolean;
  alerts: Alert[];
  apiFirmwareValue: string | undefined;
  botFirmwareValue: string | undefined;
  mcuFirmwareValue: string | undefined;
  shouldDisplay: ShouldDisplay;
  timeSettings: TimeSettings;
  dispatch: Function;
}

export interface FlashFirmwareBtnProps {
  apiFirmwareValue: string | undefined;
  botOnline: boolean;
}

export const FlashFirmwareBtn = (props: FlashFirmwareBtnProps) => {
  const { apiFirmwareValue } = props;
  return <button className="fb-button yellow"
    disabled={!apiFirmwareValue || !props.botOnline}
    onClick={() => isFwHardwareValue(apiFirmwareValue) &&
      flashFirmware(apiFirmwareValue)}>
    {t("flash firmware")}
  </button>;
};

export interface FirmwareActionsProps {
  apiFirmwareValue: string | undefined;
  botOnline: boolean;
}

export const FirmwareActions = (props: FirmwareActionsProps) => {
  const { apiFirmwareValue } = props;
  return <div className="firmware-actions">
    <p>
      {trim(`${t("Flash the")} ${lookup(apiFirmwareValue) || ""}
      ${t("firmware to your device")}:`)}
    </p>
    <FlashFirmwareBtn {...props} />
  </div>;
};

export const FirmwareHardwareStatusDetails =
  (props: FirmwareHardwareStatusDetailsProps) => {
    return <div className="firmware-hardware-status-details">
      <label>{t("Web App")}</label>
      <p>{lookup(props.apiFirmwareValue) || t("unknown")}</p>
      <label>{t("FarmBot OS")}</label>
      <p>{lookup(props.botFirmwareValue) || t("unknown")}</p>
      <label>{t("Arduino/Farmduino")}</label>
      <p>{lookup(props.mcuFirmwareValue) || t("unknown")}</p>
      {props.shouldDisplay(Feature.flash_firmware) &&
        <div>
          <label>{t("Actions")}</label>
          <FirmwareActions
            apiFirmwareValue={props.apiFirmwareValue}
            botOnline={props.botOnline} />
        </div>}
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
  shouldDisplay: ShouldDisplay;
  dispatch: Function;
}

export const FirmwareHardwareStatus = (props: FirmwareHardwareStatusProps) => {
  const { firmware_version } = props.bot.hardware.informational_settings;
  const { firmware_hardware } = props.bot.hardware.configuration;
  const status = props.apiFirmwareValue == firmware_hardware &&
    props.apiFirmwareValue == boardType(firmware_version);
  return <Popover position={Position.TOP}>
    <FirmwareHardwareStatusIcon
      firmwareHardware={firmware_hardware}
      status={status} />
    <FirmwareHardwareStatusDetails
      alerts={props.alerts}
      botOnline={props.botOnline}
      apiFirmwareValue={props.apiFirmwareValue}
      botFirmwareValue={firmware_hardware}
      mcuFirmwareValue={boardType(firmware_version)}
      timeSettings={props.timeSettings}
      dispatch={props.dispatch}
      shouldDisplay={props.shouldDisplay} />
  </Popover>;
};
